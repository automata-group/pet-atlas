import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../l10n/app_localizations.dart';
import '../bloc/directory_bloc.dart';
import '../data/models/listing_item.dart';
import 'listing_detail_screen.dart';

import '../../../core/utils/location_helper.dart';
import 'package:geolocator/geolocator.dart';

class DirectoryScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialSearchQuery;
  final bool? initialOfficialOnly;
  final String? initialPriceRange;
  final String? initialSortBy;
  final void Function(String query, bool officialOnly, String priceRange, String sortBy)? onFiltersChanged;

  const DirectoryScreen({
    super.key,
    this.initialCategory,
    this.initialSearchQuery,
    this.initialOfficialOnly,
    this.initialPriceRange,
    this.initialSortBy,
    this.onFiltersChanged,
  });

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  bool _isMapView = false;
  final MapController _mapController = MapController();
  Position? _currentPosition;
  String? _selectedCategory;

  int _selectedRadius = 100000000; // Default to Anywhere

  bool _officialOnly = false; // PDF Page 7
  String _selectedPrice = 'Any'; // PDF Page 7
  String _sortBy = 'distance'; // 'distance' or 'rating'

  late TextEditingController _searchController;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'Clinic';
    _searchQuery = widget.initialSearchQuery ?? '';
    _searchController = TextEditingController(text: _searchQuery);
    _officialOnly = widget.initialOfficialOnly ?? false;
    _selectedPrice = widget.initialPriceRange ?? 'Any';
    _sortBy = widget.initialSortBy ?? 'distance';
    _initLocationAndLoad();
  }

  @override
  void didUpdateWidget(covariant DirectoryScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialSearchQuery != oldWidget.initialSearchQuery && widget.initialSearchQuery != null) {
      _searchQuery = widget.initialSearchQuery!;
      _searchController.text = _searchQuery;
    }
    if (widget.initialOfficialOnly != oldWidget.initialOfficialOnly && widget.initialOfficialOnly != null) {
      _officialOnly = widget.initialOfficialOnly!;
    }
    if (widget.initialPriceRange != oldWidget.initialPriceRange && widget.initialPriceRange != null) {
      _selectedPrice = widget.initialPriceRange!;
    }
    if (widget.initialSortBy != oldWidget.initialSortBy && widget.initialSortBy != null) {
      _sortBy = widget.initialSortBy!;
    }
    if (widget.initialCategory != oldWidget.initialCategory && widget.initialCategory != null) {
      _selectedCategory = widget.initialCategory!;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _initLocationAndLoad() async {
    final position = await LocationHelper.getCurrentLocation();
    if (mounted) {
      setState(() => _currentPosition = position);
      _loadData();
    }
  }

  void _loadData() {
    context.read<DirectoryBloc>().add(LoadDirectoryEvent(
      type: _selectedCategory,
      lat: _currentPosition?.latitude,
      lon: _currentPosition?.longitude,
      radius: _selectedRadius,
      isOfficial: _officialOnly,
      priceRange: _selectedPrice,
      sortBy: _sortBy,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final primaryColor = const Color(0xFF00B0F0);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(l10n.navLists, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(_isMapView ? Icons.list : Icons.map_outlined, color: primaryColor),
            onPressed: () => setState(() => _isMapView = !_isMapView),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(l10n),
          _buildCategoryFilter(context, l10n),
          _buildAdvancedFilters(primaryColor),
          _buildRadiusFilter(primaryColor),
          Expanded(
            child: BlocBuilder<DirectoryBloc, DirectoryState>(
              builder: (context, state) {
                if (state is DirectoryLoading) {
                  return const Center(child: CircularProgressIndicator());
                } else if (state is DirectoryLoaded) {
                  // Client-side filtering for instant UI responsiveness
                  var filtered = state.listings;
                  if (_officialOnly) filtered = filtered.where((l) => l.isOfficial).toList();
                  if (_selectedPrice != 'Any') filtered = filtered.where((l) => l.priceRange == _selectedPrice).toList();
                  if (_searchQuery.isNotEmpty) {
                    final query = _searchQuery.toLowerCase();
                    filtered = filtered.where((l) {
                      final titleMatch = l.title.toLowerCase().contains(query);
                      final descMatch = l.description.toLowerCase().contains(query);
                      final addrMatch = l.address.toLowerCase().contains(query);
                      final servicesMatch = l.services.any((s) =>
                          s.name.toLowerCase().contains(query) ||
                          s.description.toLowerCase().contains(query));
                      return titleMatch || descMatch || addrMatch || servicesMatch;
                    }).toList();
                  }

                  if (filtered.isEmpty) return _buildEmptyState();
                  
                  return _isMapView 
                      ? _buildMapView(filtered, primaryColor)
                      : _buildListView(filtered);
                } else if (state is DirectoryError) {
                  return Center(child: Text(state.message));
                }
                return Container();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdvancedFilters(Color primaryColor) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: Row(
        children: [
          // Official Only (PDF Page 7)
          FilterChip(
            label: Text(l10n.homeOfficialOnly, style: const TextStyle(fontSize: 11)),
            selected: _officialOnly,
            onSelected: (val) {
              setState(() => _officialOnly = val);
              _loadData();
              widget.onFiltersChanged?.call(_searchQuery, _officialOnly, _selectedPrice, _sortBy);
            },
            selectedColor: primaryColor.withValues(alpha: 0.2),
            checkmarkColor: primaryColor,
          ),
          const SizedBox(width: 8),
          // Price Filter (PDF Page 7)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedPrice,
                style: const TextStyle(fontSize: 11, color: Colors.black, fontWeight: FontWeight.bold),
                items: ['Any', r'$', r'$$', r'$$$'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (val) {
                  setState(() => _selectedPrice = val!);
                  _loadData();
                  widget.onFiltersChanged?.call(_searchQuery, _officialOnly, _selectedPrice, _sortBy);
                },
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Sort by Rating (PDF Page 7)
          Expanded(
            child: InkWell(
              onTap: () {
                setState(() => _sortBy = _sortBy == 'distance' ? 'rating' : 'distance');
                _loadData();
                widget.onFiltersChanged?.call(_searchQuery, _officialOnly, _selectedPrice, _sortBy);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _sortBy == 'rating' ? primaryColor.withValues(alpha: 0.1) : Colors.transparent,
                  border: Border.all(color: _sortBy == 'rating' ? primaryColor : Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.star, size: 14, color: _sortBy == 'rating' ? primaryColor : Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      _sortBy == 'rating' ? 'Top Rated' : 'Nearest',
                      style: TextStyle(
                        fontSize: 11, 
                        fontWeight: FontWeight.bold,
                        color: _sortBy == 'rating' ? primaryColor : Colors.black
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRadiusFilter(Color primaryColor) {
    if (_currentPosition == null) return const SizedBox.shrink();
    
    final radiusOptions = [
      {'label': '5 km', 'value': 5000},
      {'label': '10 km', 'value': 10000},
      {'label': '20 km', 'value': 20000},
      {'label': '50 km', 'value': 50000},
      {'label': 'Anywhere', 'value': 100000000},
    ];

    return Container(
      height: 40,
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: radiusOptions.length,
        itemBuilder: (context, index) {
          final opt = radiusOptions[index];
          final isSelected = _selectedRadius == opt['value'];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: ChoiceChip(
              label: Text(opt['label'] as String, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : Colors.black)),
              selected: isSelected,
              selectedColor: primaryColor,
              backgroundColor: Colors.grey[100],
              onSelected: (selected) {
                if (selected) {
                  setState(() => _selectedRadius = opt['value'] as int);
                  _loadData();
                }
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildListView(List<ListingItem> listings) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: listings.length,
      itemBuilder: (context, index) {
        return _buildListingCard(context, listings[index]);
      },
    );
  }

  Widget _buildMapView(List<ListingItem> listings, Color primaryColor) {
    final listingsWithCoords = listings.where((l) => l.lat != null && l.lon != null).toList();
    
    LatLng center = _currentPosition != null 
        ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
        : const LatLng(25.2048, 55.2708);
    
    if (listingsWithCoords.isNotEmpty && _currentPosition == null) {
      center = LatLng(listingsWithCoords.first.lat!, listingsWithCoords.first.lon!);
    }

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: center,
        initialZoom: 12.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.petatlas.app',
        ),
        MarkerLayer(
          markers: [
            if (_currentPosition != null)
              Marker(
                point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                width: 40,
                height: 40,
                child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
              ),
            ...listingsWithCoords.map((item) => Marker(
              point: LatLng(item.lat!, item.lon!),
              width: 80,
              height: 80,
              child: GestureDetector(
                onTap: () => _showMarkerPreview(context, item, primaryColor),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
                      ),
                      child: Text(
                        item.title,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(Icons.location_on, color: primaryColor, size: 40),
                  ],
                ),
              ),
            )),
          ],
        ),
      ],
    );
  }

  void _showMarkerPreview(BuildContext context, ListingItem item, Color primaryColor) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        margin: const EdgeInsets.all(16),
        child: _buildListingCard(context, item),
      ),
    );
  }

  Widget _buildSearchBar(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
          });
          widget.onFiltersChanged?.call(_searchQuery, _officialOnly, _selectedPrice, _sortBy);
        },
        decoration: InputDecoration(
          hintText: l10n.searchPlaceholder,
          prefixIcon: const Icon(Icons.search, color: Color(0xFF00B0F0)),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _searchQuery = '';
                    });
                    widget.onFiltersChanged?.call('', _officialOnly, _selectedPrice, _sortBy);
                  },
                )
              : null,
          fillColor: const Color(0xFFF5F8F8),
          filled: true,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilter(BuildContext context, AppLocalizations l10n) {
    final categories = [
      {'id': 'Clinic', 'label': l10n.serviceClinics},
      {'id': 'Vet', 'label': l10n.serviceVets},
      {'id': 'Grooming', 'label': l10n.serviceGrooming},
      {'id': 'Insurance', 'label': 'Insurance'},
      {'id': 'MobileClinic', 'label': 'Mobile Clinics'},
      {'id': 'PetSitter', 'label': 'Pet Sitters'},
      {'id': 'Boarding', 'label': 'Boarding'},
      {'id': 'Event', 'label': 'Events'},
    ];

    return Container(
      height: 50,
      color: Colors.white,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: ActionChip(
              label: Text(cat['label']!),
              backgroundColor: _selectedCategory == cat['id'] 
                  ? const Color(0xFF00B0F0) 
                  : const Color(0xFF00B0F0).withValues(alpha: 0.1),
              labelStyle: TextStyle(
                color: _selectedCategory == cat['id'] ? Colors.white : Colors.black,
              ),
              onPressed: () {
                setState(() => _selectedCategory = cat['id'] as String);
                _loadData();
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildListingCard(BuildContext context, ListingItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ListingDetailScreen(item: item),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: item.logoUrl != null 
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(item.logoUrl!, fit: BoxFit.cover),
                    )
                  : const Icon(Icons.pets, color: Color(0xFF00B0F0), size: 40),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text(item.address, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.orange, size: 16),
                        const SizedBox(width: 4),
                        Text(item.avgStars.toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                        const Spacer(),
                        if (item.distance != null)
                           Text('${(item.distance! / 1000).toStringAsFixed(1)} km', style: const TextStyle(color: Color(0xFF00B0F0), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text('No listings found in this category.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

