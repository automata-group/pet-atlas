import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../l10n/app_localizations.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/blog_skeleton_card.dart';
import 'bloc/blog_bloc.dart';
import 'blog_detail_screen.dart';

class BlogScreen extends StatefulWidget {
  const BlogScreen({super.key});

  @override
  State<BlogScreen> createState() => _BlogScreenState();
}

class _BlogScreenState extends State<BlogScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  String? _currentLocale;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      if (_currentLocale != null) {
        context.read<BlogBloc>().add(LoadMoreBlogsEvent(locale: _currentLocale!));
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final locale = Localizations.localeOf(context).languageCode;
    if (_currentLocale != locale) {
      _currentLocale = locale;
      context.read<BlogBloc>().add(LoadBlogsEvent(locale: locale));
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return BlocBuilder<BlogBloc, BlogState>(
      builder: (context, state) {
        String? activeFilter;
        List<BlogPost> posts = [];
        
        int loadingCount = 0;
        
        if (state is BlogLoaded) {
          activeFilter = state.activeFilter;
          posts = state.posts;
          loadingCount = state.loadingCount;
        }

        return Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                controller: _searchController,
                onChanged: (value) {
                  context.read<BlogBloc>().add(SearchBlogsEvent(query: value));
                },
                decoration: InputDecoration(
                  hintText: 'Search blogs...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.primary),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.grey.withValues(alpha: 0.3)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                ),
              ),
            ),
            // Filter Tags
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 0.0,
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterTag(
                      context,
                      'All',
                      l10n.blogRecent,
                      activeFilter == null,
                    ),
                    _buildFilterTag(
                      context,
                      'Dog',
                      l10n.tagDog,
                      activeFilter == 'Dog',
                    ),
                    _buildFilterTag(
                      context,
                      'Cat',
                      l10n.tagCat,
                      activeFilter == 'Cat',
                    ),
                    _buildFilterTag(
                      context,
                      'Exotic',
                      l10n.tagExotic,
                      activeFilter == 'Exotic',
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: state is BlogLoading || state is BlogInitial
                ? ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: 5,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) => const BlogSkeletonCard(width: double.infinity),
                  )
                : state is BlogError
                    ? Center(child: Text(state.message))
                    : ListView.separated(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: posts.length + loadingCount,
                        separatorBuilder: (context, index) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          if (index >= posts.length) {
                            return const BlogSkeletonCard(width: double.infinity);
                          }
                          final post = posts[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.slate800 : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark
                              ? AppColors.slate700
                              : AppColors.slate100,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Stack(
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(16),
                                ),
                                child: Image.network(
                                  post.imageUrl,
                                  height: 200,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) =>
                                      Container(
                                        height: 200,
                                        color: AppColors.slate200,
                                        child: const Center(
                                          child: Icon(Icons.error),
                                        ),
                                      ),
                                ),
                              ),
                              Positioned(
                                top: 12,
                                right: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.9),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    post.tag.toUpperCase(),
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.slate800,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  post.title,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  post.subtitle,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: isDark
                                        ? AppColors.slate400
                                        : AppColors.slate500,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          backgroundColor: AppColors.primary
                                              .withValues(alpha: 0.1),
                                          radius: 12,
                                          child: const Icon(
                                            Icons.person,
                                            size: 16,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '${l10n.blogAuthorPrefix} ${post.author}',
                                          style: theme.textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                    Text(
                                      post.date,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: isDark
                                                ? AppColors.slate400
                                                : AppColors.slate400,
                                          ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              BlogDetailScreen(
                                                imageUrl: post.imageUrl,
                                                tag: post.tag,
                                                title: post.title,
                                                subtitle: post.subtitle,
                                                author: post.author,
                                                date: post.date,
                                                content: post.content,
                                              ),
                                        ),
                                      );
                                    },
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(
                                        color: AppColors.primary.withValues(
                                          alpha: 0.5,
                                        ),
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: Text(
                                      l10n.blogReadMore,
                                      style: const TextStyle(
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFilterTag(
    BuildContext context,
    String filterValue,
    String displayString,
    bool isActive,
  ) {
    return GestureDetector(
      onTap: () {
        context.read<BlogBloc>().add(
          FilterBlogsEvent(tag: filterValue == 'All' ? '' : filterValue),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8.0),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primary
              : AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          displayString,
          style: TextStyle(
            color: isActive ? Colors.white : AppColors.primary,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
