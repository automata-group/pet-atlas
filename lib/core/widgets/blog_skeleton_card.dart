import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class BlogSkeletonCard extends StatefulWidget {
  final double width;
  const BlogSkeletonCard({super.key, this.width = 280});

  @override
  State<BlogSkeletonCard> createState() => _BlogSkeletonCardState();
}

class _BlogSkeletonCardState extends State<BlogSkeletonCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    final baseColor = isDark ? AppColors.slate700 : Colors.grey[300]!;
    final highlightColor = isDark ? AppColors.slate500 : Colors.grey[100]!;

    return Container(
      width: widget.width,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate800 : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.slate700 : AppColors.slate100,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              _buildShimmerBlock(height: 160, width: double.infinity, baseColor: baseColor, highlightColor: highlightColor, borderRadius: 0),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: _buildShimmerBlock(height: 12, width: 40, baseColor: Colors.grey[300]!, highlightColor: Colors.grey[100]!, borderRadius: 2),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildShimmerBlock(height: 14, width: widget.width * 0.8, baseColor: baseColor, highlightColor: highlightColor),
                const SizedBox(height: 6),
                _buildShimmerBlock(height: 14, width: widget.width * 0.5, baseColor: baseColor, highlightColor: highlightColor),
                const SizedBox(height: 12),
                _buildShimmerBlock(height: 12, width: double.infinity, baseColor: baseColor, highlightColor: highlightColor),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerBlock({required double height, required double width, required Color baseColor, required Color highlightColor, double borderRadius = 4}) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          height: height,
          width: width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(borderRadius),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: const [0.0, 0.5, 1.0],
              colors: [
                baseColor,
                highlightColor,
                baseColor,
              ],
              transform: _SlidingGradientTransform(slidePercent: _animation.value),
            ),
          ),
        );
      },
    );
  }
}

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;
  const _SlidingGradientTransform({required this.slidePercent});

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0.0, 0.0);
  }
}
