import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../data/models/listing_item.dart';
import '../../booking/bloc/booking_bloc.dart';
import '../../profile/data/models/pet.dart';
import '../../profile/data/repositories/profile_repository.dart';
import '../../../l10n/app_localizations.dart';
import '../../chat/bloc/chat_bloc.dart';
import '../../chat/data/repositories/chat_repository.dart';
import '../../chat/presentation/chat_room_screen.dart';
import 'widgets/category_components.dart';

class ListingDetailScreen extends StatefulWidget {
  final ListingItem item;

  const ListingDetailScreen({super.key, required this.item});

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  final Set<ClinicService> _selectedServices = {};

  void _toggleService(ClinicService service) {
    setState(() {
      if (_selectedServices.contains(service)) {
        _selectedServices.remove(service);
      } else {
        _selectedServices.add(service);
      }
    });
  }

  // Support for dynamic grooming services
  final Map<String, double> _selectedGroomingServices = {};

  void _toggleGroomingService(String serviceName, double price) {
    setState(() {
      if (_selectedGroomingServices.containsKey(serviceName)) {
        _selectedGroomingServices.remove(serviceName);
      } else {
        _selectedGroomingServices[serviceName] = price;
      }
    });
  }

  double get _totalPrice {
    if (widget.item.listingType == 'Grooming') {
      return _selectedGroomingServices.values.fold(0, (sum, price) => sum + price);
    }
    return _selectedServices.fold(0, (sum, item) => sum + item.price);
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = const Color(0xFF00B0F0);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F8F8),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              _buildAppBar(context, primaryColor),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(primaryColor),
                      const SizedBox(height: 24),
                      _buildQuickActions(primaryColor),
                      const SizedBox(height: 32),
                      
                      _buildSectionHeader(
                        widget.item.listingType == 'Clinic' ? 'About Clinic' : 
                        widget.item.listingType == 'Vet' ? 'About Specialist' :
                        widget.item.listingType == 'Insurance' ? 'Insurance Provider' :
                        widget.item.listingType == 'Shop' ? 'Store Information' : 'About Service',
                        primaryColor, 
                        priceRange: widget.item.priceRange
                      ),
                      const SizedBox(height: 12),
                      Text(
                        widget.item.description,
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.6,
                          color: Colors.blueGrey[700],
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Category Specific Metadata
                      if (widget.item.metadata != null) ...[
                        if (widget.item.listingType == 'Vet') ...[
                          VetMetadataWidget(metadata: widget.item.metadata!),
                          const SizedBox(height: 32),
                        ],
                        if (widget.item.listingType == 'Shop') ...[
                          ShopInfoWidget(metadata: widget.item.metadata!),
                          const SizedBox(height: 32),
                        ],
                      ],

                      if (widget.item.galleryUrls.isNotEmpty) ...[
                        _buildSectionHeader('Gallery', primaryColor),
                        const SizedBox(height: 16),
                        _buildGallery(),
                        const SizedBox(height: 32),
                      ],

                      // Specialized Service Menus / Plan Displays
                      if ((widget.item.listingType == 'Clinic' || widget.item.listingType == 'MobileClinic') && widget.item.equipments.isNotEmpty) ...[
                        _buildSectionHeader('Available Equipments', primaryColor),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: widget.item.equipments.map((eq) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.settings_suggest, size: 14, color: primaryColor),
                                const SizedBox(width: 8),
                                Text(eq, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          )).toList(),
                        ),
                        const SizedBox(height: 32),
                      ],

                      if (widget.item.listingType == 'Grooming' && widget.item.metadata != null) ...[
                        _buildSectionHeader('Grooming Services', primaryColor),
                        const SizedBox(height: 16),
                        GroomingServiceMenu(
                          metadata: widget.item.metadata!,
                          selectedServices: _selectedGroomingServices.keys.toSet(),
                          onServiceToggle: _toggleGroomingService,
                        ),
                        const SizedBox(height: 32),
                      ] else if (widget.item.listingType == 'Insurance' && widget.item.metadata != null) ...[
                        InsurancePlansWidget(
                          metadata: widget.item.metadata!,
                          onQuoteRequest: () => _showQuoteForm(context, primaryColor),
                        ),
                        const SizedBox(height: 32),
                      ] else if (widget.item.services.isNotEmpty) ...[
                        _buildSectionHeader('Service Menu', primaryColor),
                        const SizedBox(height: 16),
                        _buildServiceMenu(primaryColor),
                        const SizedBox(height: 32),
                      ],

                      _buildSectionHeader('Location', primaryColor),
                      const SizedBox(height: 16),
                      _buildMap(primaryColor),
                      const SizedBox(height: 120), // Bottom padding for fixed button
                    ],
                  ),
                ),
              ),
            ],
          ),
          _buildBottomBar(primaryColor),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context, Color primary) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      backgroundColor: Colors.white,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primary.withValues(alpha: 0.1), Colors.white],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Center(
                child: widget.item.logoUrl != null 
                  ? Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, spreadRadius: 5)
                        ],
                        border: Border.all(color: Colors.white, width: 4),
                        image: DecorationImage(
                          image: NetworkImage(widget.item.logoUrl!),
                          fit: BoxFit.cover,
                        ),
                      ),
                    )
                  : Icon(Icons.pets, size: 100, color: primary),
              ),
            ),
          ],
        ),
      ),
      leading: Padding(
        padding: const EdgeInsets.all(8.0),
        child: CircleAvatar(
          backgroundColor: Colors.white.withValues(alpha: 0.9),
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: Colors.white.withValues(alpha: 0.9),
            child: IconButton(
              icon: const Icon(Icons.share, color: Colors.black),
              onPressed: () {},
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(Color primary) {
    return Column(
      children: [
        Text(
          widget.item.title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -0.5),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(widget.item.listingType, style: TextStyle(color: primary, fontWeight: FontWeight.bold)),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text('•', style: TextStyle(color: Colors.grey)),
            ),
            Text(widget.item.address.split(',').last.trim(), style: const TextStyle(color: Colors.grey)),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(30),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.star, color: Colors.orange, size: 18),
              const SizedBox(width: 4),
              Text(
                widget.item.avgStars.toString(),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(width: 8),
              const Text('(1,248 reviews)', style: TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(Color primary) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildActionItem(
          Icons.chat_bubble_outline, 
          'Chat Now', 
          primary,
          onTap: () async {
            try {
              final chatRepo = RepositoryProvider.of<ChatRepository>(context);
              if (widget.item.ownerId == null) {
                throw 'Consultant account not found';
              }
              final chat = await chatRepo.startConsultation(
                widget.item.ownerId!,
                widget.item.title
              );
              if (mounted) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ChatRoomScreen(chat: chat)),
                );
              }
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error starting chat: $e'))
                );
              }
            }
          }
        ),
        _buildActionItem(Icons.directions_outlined, 'Directions', primary),
        _buildActionItem(Icons.calendar_today_outlined, 'Book Visit', primary, onTap: () => _showBookingDialog()),
      ],
    );
  }

  Widget _buildActionItem(IconData icon, String label, Color primary, {VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: primary.withValues(alpha: 0.1)),
            boxShadow: [
               BoxShadow(color: primary.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))
            ],
          ),
          child: Column(
            children: [
              Icon(icon, color: primary),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color primary, {String? priceRange}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        if (priceRange != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              'Price Range: $priceRange',
              style: TextStyle(color: primary, fontWeight: FontWeight.bold, fontSize: 11),
            ),
          ),
      ],
    );
  }

  Widget _buildGallery() {
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: widget.item.galleryUrls.length,
        itemBuilder: (context, index) {
          return Container(
            width: 260,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              image: DecorationImage(
                image: NetworkImage(widget.item.galleryUrls[index]),
                fit: BoxFit.cover,
              ),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, 4))
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildServiceMenu(Color primary) {
    return Column(
      children: widget.item.services.map((service) {
        final isSelected = _selectedServices.contains(service);
        return GestureDetector(
          onTap: () => _toggleService(service),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? primary.withValues(alpha: 0.05) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? primary : primary.withValues(alpha: 0.05),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(service.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(service.description, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
                Text(
                  '\$${service.price.toInt()}',
                  style: TextStyle(color: primary, fontWeight: FontWeight.w900, fontSize: 18),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildMap(Color primary) {
    if (widget.item.lat == null) return Container();
    
    return Container(
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primary.withValues(alpha: 0.1)),
      ),
      clipBehavior: Clip.antiAlias,
      child: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(widget.item.lat!, widget.item.lon!),
          initialZoom: 15.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.petatlas.app',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(widget.item.lat!, widget.item.lon!),
                width: 80,
                height: 80,
                child: Icon(Icons.location_on, color: primary, size: 40),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(Color primary) {
    final l10n = AppLocalizations.of(context)!;
    if (widget.item.listingType == 'Insurance') return const SizedBox.shrink();
    if (widget.item.listingType == 'Shop') {
       return Positioned(
        bottom: 0,
        left: 0,
        right: 0,
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.9),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5))
            ],
          ),
          child: ElevatedButton(
            onPressed: () {}, // Redirect to shop website or internal commerce
            style: ElevatedButton.styleFrom(
              backgroundColor: primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.shopping_bag_outlined),
                const SizedBox(width: 12),
                Text(l10n.dirVisitOnlineStore, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      );
    }

    final hasSelection = widget.item.listingType == 'Grooming' 
      ? _selectedGroomingServices.isNotEmpty 
      : _selectedServices.isNotEmpty;

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5))
          ],
        ),
        child: ElevatedButton(
          onPressed: () {
            if (widget.item.listingType == 'Insurance') {
              // Direct chat for Insurance (PDF Page 8)
              _openInsuranceChat();
            } else {
              if (hasSelection) _showBookingDialog();
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            disabledBackgroundColor: Colors.grey[300],
            padding: const EdgeInsets.symmetric(vertical: 18),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 0,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(widget.item.listingType == 'Insurance' ? Icons.chat_bubble : Icons.event_available),
              const SizedBox(width: 12),
              Text(
                widget.item.listingType == 'Insurance'
                  ? 'Send Direct Request / Claim'
                  : (!hasSelection ? 'Select Services to Book' : 'Schedule Appointment'),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showQuoteForm(BuildContext context, Color primary) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.dirRequestInsuranceQuote),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('We will send your request to the provider. They will contact you within 24 hours.'),
            const SizedBox(height: 16),
            TextField(decoration: InputDecoration(labelText: 'Preferred Contact Number', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(l10n.dirCancel)),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Quote request sent!'), backgroundColor: Colors.green));
            }, 
            style: ElevatedButton.styleFrom(backgroundColor: primary),
            child: Text(l10n.dirSubmitRequest),
          ),
        ],
      ),
    );
  }

  void _openInsuranceChat() {
    context.read<ChatBloc>().add(StartConsultation(
      listingId: widget.item.id,
      listingName: widget.item.title,
    ));
    // Usually, BlocListener handles navigation to the ChatRoomScreen
  }

  void _showBookingDialog() {
    final List<Map<String, dynamic>> services = widget.item.listingType == 'Grooming'
      ? _selectedGroomingServices.entries.map((e) => {'name': e.key, 'price': e.value}).toList()
      : _selectedServices.map((s) => {'name': s.name, 'price': s.price}).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BookingBottomSheet(
        listingId: widget.item.id,
        services: services,
        totalPrice: _totalPrice,
      ),
    );
  }
}

class _BookingBottomSheet extends StatefulWidget {
  final int listingId;
  final List<Map<String, dynamic>> services;
  final double totalPrice;

  const _BookingBottomSheet({
    required this.listingId,
    required this.services,
    required this.totalPrice,
  });

  @override
  State<_BookingBottomSheet> createState() => _BookingBottomSheetState();
}

class _BookingBottomSheetState extends State<_BookingBottomSheet> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _bookingType = 'Clinic'; // Added for PDF Page 5
  int? _selectedPetId;
  List<Pet> _pets = [];
  bool _isLoadingPets = true;

  @override
  void initState() {
    super.initState();
    _loadPets();
  }

  Future<void> _loadPets() async {
    try {
      final pets = await context.read<ProfileRepository>().getMyPets();
      if (mounted) {
        setState(() {
          _pets = pets;
          _isLoadingPets = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingPets = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).primaryColor;
    final l10n = AppLocalizations.of(context)!;

    return BlocListener<BookingBloc, BookingState>(
      listener: (context, state) {
        if (state is BookingSuccess && state.message != null) {
          Navigator.pop(context); // Close bottom sheet
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message!),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );
        } else if (state is BookingError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.dirConfirmBooking, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 24),
            Text(l10n.dirAppointmentType, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _bookingType = 'Clinic'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _bookingType == 'Clinic' ? primaryColor : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          'Clinic', 
                          style: TextStyle(
                            color: _bookingType == 'Clinic' ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold
                          )
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _bookingType = 'Home Visit'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _bookingType == 'Home Visit' ? primaryColor : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          'Home Visit', 
                          style: TextStyle(
                            color: _bookingType == 'Home Visit' ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold
                          )
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(l10n.dirSelectPet, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            if (_isLoadingPets)
              const Center(child: LinearProgressIndicator())
            else if (_pets.isEmpty)
              const Text('No pets found in your profile. You can still book without selecting a pet.', 
                  style: TextStyle(color: Colors.grey, fontSize: 12))
            else
              SizedBox(
                height: 50,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _pets.length,
                  itemBuilder: (context, index) {
                    final pet = _pets[index];
                    final isSelected = _selectedPetId == pet.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedPetId = pet.id),
                      child: Container(
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          color: isSelected ? primaryColor : Colors.white,
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(color: primaryColor.withValues(alpha: 0.2)),
                        ),
                        child: Center(
                          child: Text(
                            pet.name,
                            style: TextStyle(
                              color: isSelected ? Colors.white : Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 24),
            Text(l10n.dirSelectDate, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            InkWell(
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 90)),
                );
                if (date != null) setState(() => _selectedDate = date);
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_month, color: primaryColor),
                    const SizedBox(width: 12),
                    Text('${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(l10n.dirSummary, style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...widget.services.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(s['name']),
                  Text('\$${s['price'].toInt()}'),
                ],
              ),
            )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(l10n.dirTotal, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text('\$${widget.totalPrice.toInt()}', style: TextStyle(fontWeight: FontWeight.bold, color: primaryColor)),
              ],
            ),
            const SizedBox(height: 32),
            BlocBuilder<BookingBloc, BookingState>(
              builder: (context, state) {
                final isLoading = state is BookingLoading;
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : () {
                      context.read<BookingBloc>().add(CreateBooking(
                        listingId: widget.listingId,
                        selectedServices: widget.services,
                        bookingDate: _selectedDate,
                        petId: _selectedPetId,
                      ));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey[300],
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: isLoading 
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Confirm & Pay later', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
