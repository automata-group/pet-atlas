import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../l10n/app_localizations.dart';

import '../../core/theme/app_colors.dart';
import '../../core/bloc/theme_bloc.dart';
import '../../core/bloc/locale_bloc.dart';
import '../../core/widgets/primary_button.dart';
import '../../core/widgets/search_field.dart';
import '../../core/widgets/service_card.dart';
import '../../core/widgets/blog_post_card.dart';
import '../../core/widgets/blog_skeleton_card.dart';
import '../blog/blog_screen.dart';
import '../blog/blog_detail_screen.dart';
import '../profile/profile_screen.dart';
import '../auth/bloc/auth_bloc.dart';
import '../directory/presentation/directory_screen.dart';
import '../directory/bloc/directory_bloc.dart';
import '../directory/bloc/system_config_cubit.dart';
import '../chat/presentation/chat_list_screen.dart';
import '../blog/bloc/blog_bloc.dart';
import 'discounts_screen.dart';
import 'notifications_screen.dart';
import '../chat/presentation/chat_room_screen.dart';
import '../chat/data/repositories/chat_repository.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late TextEditingController _homeSearchController;
  String _homeSearchQuery = '';
  bool _homeOfficialOnly = false;
  String _homePriceRange = 'Any';
  String _homeSortBy = 'distance';

  @override
  void initState() {
    super.initState();
    _homeSearchController = TextEditingController();
  }

  @override
  void dispose() {
    _homeSearchController.dispose();
    super.dispose();
  }

  void _showHomeFilterBottomSheet() {
    final l10n = AppLocalizations.of(context)!;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Filter Listings',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Official Only Switch
                  SwitchListTile(
                    title: Text(l10n.homeOfficialOnly, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(l10n.homeOfficialSubtitle),
                    value: _homeOfficialOnly,
                    activeColor: AppColors.primary,
                    onChanged: (val) {
                      setModalState(() {
                        _homeOfficialOnly = val;
                      });
                    },
                  ),
                  const Divider(),
                  const SizedBox(height: 8),

                  // Price Range selector
                  Text(l10n.homePriceRange, style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: ['Any', r'$', r'$$', r'$$$'].map((price) {
                      final isSelected = _homePriceRange == price;
                      return ChoiceChip(
                        label: Text(price),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() {
                              _homePriceRange = price;
                            });
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),

                  // Sort By Selector
                  Text(l10n.homeSortBy, style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ChoiceChip(
                        label: Text(l10n.homeNearest),
                        selected: _homeSortBy == 'distance',
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: _homeSortBy == 'distance' ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() {
                              _homeSortBy = 'distance';
                            });
                          }
                        },
                      ),
                      ChoiceChip(
                        label: Text(l10n.homeTopRated),
                        selected: _homeSortBy == 'rating',
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: _homeSortBy == 'rating' ? Colors.white : Colors.black,
                          fontWeight: FontWeight.bold,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() {
                              _homeSortBy = 'rating';
                            });
                          }
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Apply Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                        setState(() {
                          _currentIndex = 1; // Switch to Directory tab
                        });
                      },
                      child: const Text(
                        'Apply Filters',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    return BlocBuilder<SystemConfigCubit, SystemConfigState>(
      builder: (context, configState) {
        final clinicsEnabled = configState.clinicsEnabled;

        final List<Widget> activePages = [
          HomeContent(
            searchController: _homeSearchController,
            onFilterPressed: _showHomeFilterBottomSheet,
            onSearchSubmitted: (query) {
              setState(() {
                _homeSearchQuery = query;
                _currentIndex = 1; // Switch to Directory tab
              });
            },
            onSearchPressed: () {
              setState(() {
                _homeSearchQuery = _homeSearchController.text;
                _currentIndex = 1; // Switch to Directory tab
              });
            },
          ),
          if (clinicsEnabled) DirectoryScreen(
            initialSearchQuery: _homeSearchQuery,
            initialOfficialOnly: _homeOfficialOnly,
            initialPriceRange: _homePriceRange,
            initialSortBy: _homeSortBy,
            onFiltersChanged: (query, officialOnly, priceRange, sortBy) {
              setState(() {
                _homeSearchQuery = query;
                _homeSearchController.text = query;
                _homeOfficialOnly = officialOnly;
                _homePriceRange = priceRange;
                _homeSortBy = sortBy;
              });
            },
          ),
          const DiscountsScreen(),
          const BlogScreen(),
          const ProfileScreen(),
        ];

        final List<BottomNavigationBarItem> activeNavItems = [
          BottomNavigationBarItem(icon: const Icon(Icons.home_filled), label: l10n.navHome),
          if (clinicsEnabled) BottomNavigationBarItem(icon: const Icon(Icons.map_outlined), label: l10n.navLists),
          BottomNavigationBarItem(icon: const Icon(Icons.local_offer_outlined), label: l10n.navDiscounts),
          BottomNavigationBarItem(icon: const Icon(Icons.article_outlined), label: l10n.blogTitle),
          BottomNavigationBarItem(icon: const Icon(Icons.account_circle_outlined), label: l10n.navProfile),
        ];

        if (_currentIndex >= activePages.length) {
          _currentIndex = 0;
        }

        return Scaffold(
          appBar: AppBar(
            title: _currentIndex == 0
                ? Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.pets,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('Pet Atlas'),
                    ],
                  )
                : Text(_getAppBarTitle(l10n, clinicsEnabled)),
            centerTitle: _currentIndex != 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined),
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationsScreen()));
                },
                tooltip: 'Notifications',
              ),
              IconButton(
                icon: const Icon(Icons.language),
                onPressed: () {
                  context.read<LocaleBloc>().add(ToggleLocaleEvent());
                },
                tooltip: 'Switch Language',
              ),
              IconButton(
                icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
                onPressed: () {
                  context.read<ThemeBloc>().add(ToggleThemeEvent());
                },
                tooltip: 'Toggle Theme',
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              await context.read<SystemConfigCubit>().loadConfig();
            },
            child: activePages[_currentIndex],
          ),
          floatingActionButton: FloatingActionButton(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) => const ChatListScreen()));
            },
            tooltip: 'Chat',
            child: const Icon(Icons.chat_bubble_outline),
          ),
          bottomNavigationBar: BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            backgroundColor: isDark ? AppColors.slate900 : Colors.white,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: isDark ? AppColors.slate500 : AppColors.slate400,
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            items: activeNavItems,
          ),
        );
      },
    );
  }

  String _getAppBarTitle(AppLocalizations l10n, bool clinicsEnabled) {
    if (clinicsEnabled) {
      switch (_currentIndex) {
        case 1: return l10n.navLists;
        case 2: return l10n.navDiscounts;
        case 3: return l10n.blogTitle;
        case 4: return l10n.navProfile;
        default: return 'Pet Atlas';
      }
    } else {
      switch (_currentIndex) {
        case 1: return l10n.navDiscounts;
        case 2: return l10n.blogTitle;
        case 3: return l10n.navProfile;
        default: return 'Pet Atlas';
      }
    }
  }
}

class HomeContent extends StatelessWidget {
  final TextEditingController searchController;
  final VoidCallback onFilterPressed;
  final void Function(String) onSearchSubmitted;
  final VoidCallback onSearchPressed;

  const HomeContent({
    super.key,
    required this.searchController,
    required this.onFilterPressed,
    required this.onSearchSubmitted,
    required this.onSearchPressed,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return BlocBuilder<SystemConfigCubit, SystemConfigState>(
      builder: (context, configState) {
        final clinicsEnabled = configState.clinicsEnabled;

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Section
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            flex: 7,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                BlocBuilder<AuthBloc, AuthState>(
                                  builder: (context, state) {
                                    String greeting = l10n.heroTitle;
                                    if (state is AuthAuthenticated) {
                                      greeting = 'Hi ${state.username}, ${l10n.heroTitle.toLowerCase()}';
                                    }
                                    return Text(
                                      greeting,
                                      style: theme.textTheme.titleLarge?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  l10n.heroSubtitle,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(flex: 3, child: Container()),
                        ],
                      ),
                      Positioned(
                        right: -30,
                        top: -20,
                        child: Icon(
                          Icons.pets,
                          size: 100,
                          color: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Quick Action
              if (clinicsEnabled)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: PrimaryButton(
                    title: l10n.homeVisitTitle,
                    subtitle: l10n.homeVisitSubtitle,
                    icon: Icons.health_and_safety,
                    onPressed: () async {
                      showDialog(
                        context: context,
                        barrierDismissible: false,
                        builder: (context) => const Center(
                          child: CircularProgressIndicator(),
                        ),
                      );
                      try {
                        final chatRepo = RepositoryProvider.of<ChatRepository>(context);
                        final chat = await chatRepo.startConsultation(
                          1,
                          "Pet-Atlas Support Team"
                        );
                        if (context.mounted) {
                          Navigator.pop(context); // Pop loading dialog
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatRoomScreen(chat: chat),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          Navigator.pop(context); // Pop loading dialog
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error starting chat: $e'))
                          );
                        }
                      }
                    },
                  ),
                ),
              if (clinicsEnabled) const SizedBox(height: 24),

              // Search Bar
              if (clinicsEnabled)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: SearchField(
                    hintText: l10n.searchPlaceholder,
                    controller: searchController,
                    onFilterPressed: onFilterPressed,
                    onSubmitted: onSearchSubmitted,
                    onSearchPressed: onSearchPressed,
                  ),
                ),
              if (clinicsEnabled) const SizedBox(height: 24),

              // Services Grid
              if (clinicsEnabled) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        l10n.servicesTitle,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: Text(
                          l10n.seeAll,
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.2,
                    ),
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: configState.services.length,
                    itemBuilder: (context, index) {
                      final service = configState.services[index];
                      final isArabic = Localizations.localeOf(context).languageCode == 'ar';
                      final title = isArabic ? service.titleAr : service.titleEn;
                      
                      return ServiceCard(
                        icon: _getIconData(service.iconName),
                        title: title,
                        baseColor: _getColorFromHex(service.baseColor),
                        onTap: () {
                          context.read<DirectoryBloc>().add(LoadDirectoryEvent(type: service.listingType));
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DirectoryScreen(initialCategory: service.listingType),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Blog Preview Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.blogTitle,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              BlocBuilder<BlogBloc, BlogState>(
                builder: (context, state) {
                  if (state is BlogLoading || state is BlogInitial) {
                    return SizedBox(
                      height: 260,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        itemCount: 3,
                        itemBuilder: (context, index) {
                          return const BlogSkeletonCard();
                        },
                      ),
                    );
                  }
                  if (state is BlogLoaded) {
                    int totalCount = state.posts.length + state.loadingCount;
                    if (totalCount == 0 && state.loadingCount == 0) return const SizedBox();
                    
                    return SizedBox(
                      height: 260,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        itemCount: totalCount > 5 ? 5 : totalCount,
                        itemBuilder: (context, index) {
                          if (index >= state.posts.length) {
                            return const BlogSkeletonCard();
                          }
                          final blog = state.posts[index];
                          return BlogPostCard(
                            imageUrl: blog.imageUrl,
                            tag: blog.tag,
                            title: blog.title,
                            subtitle: blog.subtitle,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BlogDetailScreen(
                                    imageUrl: blog.imageUrl,
                                    tag: blog.tag,
                                    title: blog.title,
                                    subtitle: blog.subtitle,
                                    content: blog.content,
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    );
                  }
                  return Container();
                },
              ),
              const SizedBox(height: 100),
            ],
          ),
        );
      },
    );
  }

  IconData _getIconData(String name) {
    switch (name) {
      case 'medical_services':
        return Icons.medical_services;
      case 'vaccines':
        return Icons.vaccines;
      case 'content_cut':
        return Icons.content_cut;
      case 'pets':
        return Icons.pets;
      case 'storefront':
        return Icons.storefront;
      case 'hotel':
        return Icons.hotel;
      case 'local_taxi':
        return Icons.local_taxi;
      case 'school':
        return Icons.school;
      case 'spa':
        return Icons.spa;
      case 'health_and_safety':
        return Icons.health_and_safety;
      default:
        return Icons.pets;
    }
  }

  Color _getColorFromHex(String hexColor) {
    try {
      hexColor = hexColor.replaceAll('#', '');
      if (hexColor.length == 6) {
        hexColor = 'FF$hexColor';
      }
      return Color(int.parse(hexColor, radix: 16));
    } catch (_) {
      return Colors.blue;
    }
  }
}
