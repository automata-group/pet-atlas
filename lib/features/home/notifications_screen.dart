import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_colors.dart';
import 'bloc/notification_cubit.dart';
import 'data/models/notification_model.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    // Refresh notifications when opening the screen
    context.read<NotificationCubit>().fetchNotifications();
  }

  String _formatTime(DateTime dateTime, bool isArabic) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inSeconds < 60) {
      return isArabic ? 'الآن' : 'Just now';
    } else if (diff.inMinutes < 60) {
      return isArabic ? 'قبل ${diff.inMinutes} دقيقة' : '${diff.inMinutes} mins ago';
    } else if (diff.inHours < 24) {
      return isArabic ? 'قبل ${diff.inHours} ساعة' : '${diff.inHours} hours ago';
    } else {
      return isArabic ? 'قبل ${diff.inDays} يوم' : '${diff.inDays} days ago';
    }
  }

  IconData _getIcon(String type) {
    switch (type.toLowerCase()) {
      case 'chat':
        return Icons.chat_bubble_outline;
      case 'blog':
        return Icons.article_outlined;
      case 'booking':
        return Icons.check_circle_outline;
      case 'system':
        return Icons.security_outlined;
      default:
        return Icons.notifications_none_outlined;
    }
  }

  Color _getColor(String type) {
    switch (type.toLowerCase()) {
      case 'chat':
        return Colors.blue;
      case 'blog':
        return Colors.purple;
      case 'booking':
        return Colors.green;
      case 'system':
        return Colors.orange;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(
          isArabic ? 'الإشعارات' : 'Notifications',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: isDark ? Colors.white : Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<NotificationCubit>().fetchNotifications();
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationCubit, NotificationState>(
        builder: (context, state) {
          if (state is NotificationLoading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primary));
          } else if (state is NotificationError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 60, color: Colors.red[300]),
                    const SizedBox(height: 16),
                    Text(
                      isArabic ? 'فشل تحميل الإشعارات' : 'Failed to load notifications',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[500], fontSize: 13),
                    ),
                  ],
                ),
              ),
            );
          } else if (state is NotificationLoaded) {
            final list = state.notifications;
            if (list.isEmpty) {
              return _buildEmptyState(isArabic);
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final NotificationModel item = list[index];
                final iconColor = _getColor(item.type);

                return InkWell(
                  onTap: () {
                    if (!item.isRead) {
                      context.read<NotificationCubit>().markAsRead(item.id);
                    }
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.slate800 : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: item.isRead
                            ? (isDark ? AppColors.slate700 : AppColors.slate100)
                            : AppColors.primary.withValues(alpha: 0.3),
                      ),
                      boxShadow: [
                        if (!item.isRead)
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: iconColor.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(_getIcon(item.type), color: iconColor, size: 24),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: TextStyle(
                                        fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w900,
                                        fontSize: 15,
                                        color: isDark ? Colors.white : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    _formatTime(item.createdAt, isArabic),
                                    style: TextStyle(color: Colors.grey[500], fontSize: 11),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.message,
                                style: TextStyle(
                                  color: isDark ? AppColors.slate400 : Colors.grey[600],
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          }
          return Container();
        },
      ),
    );
  }

  Widget _buildEmptyState(bool isArabic) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            isArabic ? 'لا توجد إشعارات حالياً' : 'No notifications yet',
            style: const TextStyle(color: Colors.grey, fontSize: 16, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

