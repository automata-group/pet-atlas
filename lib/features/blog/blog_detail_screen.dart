import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';

class BlogDetailScreen extends StatelessWidget {
  final String imageUrl;
  final String tag;
  final String title;
  final String subtitle;
  final String author;
  final String date;
  final String content;

  const BlogDetailScreen({
    super.key,
    required this.imageUrl,
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.content,
    this.author = 'Dr. Sarah Jenkins', 
    this.date = 'Aug 12, 2023', 
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: isDark ? AppColors.slate900 : AppColors.primary,
            surfaceTintColor: Colors.transparent,
            expandedHeight: 320,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      color: AppColors.slate200,
                      child: const Center(child: Icon(Icons.error)),
                    ),
                  ),
                  // Dark gradient overlay for text readability
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.5),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.3),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.25),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.share_outlined, color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 8, left: 4, top: 8, bottom: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.25),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.bookmark_border, color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ),
              ),
            ],
            leading: Padding(
              padding: const EdgeInsets.only(left: 8, right: 8, top: 8, bottom: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.25),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Container(
              transform: Matrix4.translationValues(0.0, -32.0, 0.0),
              decoration: BoxDecoration(
                color: isDark ? AppColors.slate900 : Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(32),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: AppColors.primary.withValues(alpha: 0.2),
                        ),
                      ),
                      child: Text(
                        tag.toUpperCase(),
                        style: isArabic ? GoogleFonts.cairo(
                          textStyle: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                            letterSpacing: 1.2,
                          ),
                        ) : const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      title,
                      style: isArabic ? GoogleFonts.cairo(
                        textStyle: theme.textTheme.headlineLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          height: 1.4,
                        ),
                      ) : theme.textTheme.headlineLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: AppColors.primary.withValues(
                            alpha: 0.1,
                          ),
                          radius: 24,
                          child: const Icon(
                            Icons.person,
                            color: AppColors.primary,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                author,
                                style: isArabic ? GoogleFonts.cairo(
                                  textStyle: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ) : theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Icon(
                                    Icons.calendar_today,
                                    size: 14,
                                    color: isDark
                                        ? AppColors.slate400
                                        : AppColors.slate500,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    date,
                                    style: isArabic ? GoogleFonts.cairo(
                                      textStyle: theme.textTheme.bodySmall?.copyWith(
                                        color: isDark
                                            ? AppColors.slate400
                                            : AppColors.slate500,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ) : theme.textTheme.bodySmall?.copyWith(
                                      color: isDark
                                          ? AppColors.slate400
                                          : AppColors.slate500,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Icon(
                                    Icons.timer_outlined,
                                    size: 14,
                                    color: isDark
                                        ? AppColors.slate400
                                        : AppColors.slate500,
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    "5 min read",
                                    style: isArabic ? GoogleFonts.cairo(
                                      textStyle: theme.textTheme.bodySmall?.copyWith(
                                        color: isDark
                                            ? AppColors.slate400
                                            : AppColors.slate500,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ) : theme.textTheme.bodySmall?.copyWith(
                                      color: isDark
                                          ? AppColors.slate400
                                          : AppColors.slate500,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    Divider(
                      color: isDark ? AppColors.slate800 : AppColors.slate100,
                      thickness: 1.5,
                    ),
                    const SizedBox(height: 32),

                    // Subtitle logic depending on locale
                    if (isArabic)
                      Text(
                        subtitle,
                        style: GoogleFonts.cairo(
                          textStyle: theme.textTheme.titleLarge?.copyWith(
                            color: isDark ? AppColors.slate400 : AppColors.slate700,
                            height: 1.6,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: subtitle.isNotEmpty ? subtitle.substring(0, 1) : "",
                              style: theme.textTheme.displayMedium?.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                height: 1.0,
                              ),
                            ),
                            TextSpan(
                              text: subtitle.isNotEmpty ? subtitle.substring(1) : "",
                              style: theme.textTheme.titleLarge?.copyWith(
                                color: isDark ? AppColors.slate400 : AppColors.slate700,
                                height: 1.6,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 32),
                    Html(
                      data: content,
                      style: {
                        "body": Style(
                          fontFamily: isArabic ? GoogleFonts.cairo().fontFamily : null,
                          color: isDark ? AppColors.slate400 : AppColors.slate500,
                          fontSize: FontSize(16.0),
                          lineHeight: LineHeight(1.8),
                          margin: Margins.zero,
                          padding: HtmlPaddings.zero,
                        ),
                        "figure": Style(
                          margin: Margins.zero,
                          padding: HtmlPaddings.zero,
                        ),
                        "img": Style(
                          width: Width(100, Unit.percent),
                          height: Height.auto(),
                        ),
                      },
                    ),
                    const SizedBox(height: 48),

                    // Share & Like Footer
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(
                            color: isDark
                                ? AppColors.slate800
                                : AppColors.slate100,
                          ),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildActionButton(Icons.ios_share, "Share", isDark),
                        ],
                      ),
                    ),
                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label, bool isDark) {
    return Row(
      children: [
        Icon(
          icon,
          size: 22,
          color: isDark ? AppColors.slate400 : AppColors.slate500,
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            color: isDark ? AppColors.slate400 : AppColors.slate500,
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ],
    );
  }


}
