import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/chat_bloc.dart';
import '../data/models/chat_group.dart';
import '../../../core/theme/app_colors.dart';
import 'package:intl/intl.dart';
import 'chat_room_screen.dart';
import '../data/repositories/chat_repository.dart';
import '../../profile/bloc/subscription_cubit.dart';
import '../../profile/presentation/paywall_screen.dart';
import '../../../l10n/app_localizations.dart';

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});

  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen> {
  String _selectedType = 'vet_consult'; // 'vet_consult', 'announcement', 'community'

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),

      body: BlocBuilder<SubscriptionCubit, SubscriptionState>(
        builder: (context, subState) {
          final isActive = subState.status?.isActive ?? false;
          if (subState.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primary));
          }
          if (!isActive) {
            return PaywallScreen(
              onSubscribeSuccess: () {
                context.read<ChatBloc>().add(LoadMyChats());
              },
            );
          }
          return BlocBuilder<ChatBloc, ChatState>(
            builder: (context, state) {
              if (state is ChatLoading) {
                return const Center(child: CircularProgressIndicator());
              } else if (state is ChatError) {
                return Center(child: Text(state.message));
              } else if (state is ChatLoaded) {
                final filteredChats = state.chats.where((c) => c.type == _selectedType).toList();
                return _buildChatTab(
                  context,
                  filteredChats,
                  l10n,
                  isDark,
                  showBanner: _selectedType == 'vet_consult',
                );
              }
              return Container();
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showChannelSelector(context, isDark),
        backgroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.chat, color: Colors.white),
      ),
    );
  }

  void _showChannelSelector(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) => Container(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF16252A) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Select Communication Channel',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 8),
            _buildSelectorItem(
              icon: Icons.medical_services_outlined,
              title: 'Vet Chat',
              subtitle: 'Consult with specialized veterinarians',
              type: 'vet_consult',
              color: const Color(0xFF4FACFE),
              context: bottomSheetContext,
            ),
            _buildSelectorItem(
              icon: Icons.campaign_outlined,
              title: 'Announcements',
              subtitle: 'Official updates and news',
              type: 'announcement',
              color: const Color(0xFFFF5F6D),
              context: bottomSheetContext,
            ),
            _buildSelectorItem(
              icon: Icons.forum_outlined,
              title: 'Community',
              subtitle: 'Discuss with other pet owners',
              type: 'community',
              color: const Color(0xFF11998E),
              context: bottomSheetContext,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectorItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String type,
    required Color color,
    required BuildContext context,
  }) {
    final isSelected = _selectedType == type;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedType = type;
        });
        Navigator.pop(context);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: isSelected 
              ? color.withValues(alpha: 0.1) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: color, size: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildChatTab(BuildContext context, List<ChatGroup> chats, AppLocalizations l10n, bool isDark, {bool showBanner = false}) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<ChatBloc>().add(LoadMyChats());
      },
      child: ListView(
        children: [
          if (showBanner) _buildConsultationBanner(context, l10n, isDark),
          if (chats.isEmpty)
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.4,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.chat_bubble_outline, size: 48, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'No chats here',
                      style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    ),
                  ],
                ),
              ),
            )
          else
            ...chats.map((chat) => _ChatListItem(chat: chat)),
        ],
      ),
    );
  }

  Widget _buildConsultationBanner(BuildContext context, AppLocalizations l10n, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark 
              ? [AppColors.primary.withValues(alpha: 0.2), const Color(0xFF16252A)]
              : [AppColors.primary, AppColors.primary.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.consultationSection,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Expert advice for your pet',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      final chatRepo = RepositoryProvider.of<ChatRepository>(context);
                      final chat = await chatRepo.startConsultation(0, ''); // Trigger official logic
                      if (context.mounted) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ChatRoomScreen(chat: chat),
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: $e'))
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    l10n.requestConsultation,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.medical_services_outlined,
              color: Colors.white,
              size: 40,
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatListItem extends StatelessWidget {
  final ChatGroup chat;

  const _ChatListItem({required this.chat});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // Formatting time
    String timeStr = '';
    if (chat.lastMessage != null) {
      final now = DateTime.now();
      final diff = now.difference(chat.lastMessage!.createdAt);
      if (diff.inDays == 0) {
        timeStr = DateFormat('h:mm a').format(chat.lastMessage!.createdAt);
      } else if (diff.inDays == 1) {
        timeStr = 'Yesterday';
      } else {
        timeStr = DateFormat('EEEE').format(chat.lastMessage!.createdAt);
      }
    }

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatRoomScreen(chat: chat),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isDark ? Colors.white10 : Colors.black12.withValues(alpha: 0.05),
            ),
          ),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: chat.type == 'vet_consult'
                        ? const LinearGradient(
                            colors: [Color(0xFF00F2FE), Color(0xFF4FACFE)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : chat.type == 'announcement'
                            ? const LinearGradient(
                                colors: [Color(0xFFFF5F6D), Color(0xFFFFC371)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : chat.type == 'community'
                                ? const LinearGradient(
                                    colors: [Color(0xFF11998E), Color(0xFF38EF7D)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  )
                                : const LinearGradient(
                                    colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                    boxShadow: [
                      BoxShadow(
                        color: (chat.type == 'vet_consult'
                                ? const Color(0xFF4FACFE)
                                : chat.type == 'announcement'
                                    ? const Color(0xFFFF5F6D)
                                    : chat.type == 'community'
                                        ? const Color(0xFF11998E)
                                        : Colors.black)
                            .withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Center(
                    child: chat.type == 'vet_consult'
                        ? const Icon(Icons.medical_services_outlined, color: Colors.white, size: 28)
                        : chat.type == 'announcement'
                            ? const Icon(Icons.campaign_outlined, color: Colors.white, size: 28)
                            : chat.type == 'community'
                                ? const Icon(Icons.forum_outlined, color: Colors.white, size: 28)
                                : Text(
                                    chat.name.isNotEmpty ? chat.name[0].toUpperCase() : 'C',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 22,
                                    ),
                                  ),
                  ),
                ),
                if (chat.unreadCount > 0)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isDark ? const Color(0xFF0F1E23) : Colors.white,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          chat.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        timeStr,
                        style: TextStyle(
                          fontSize: 12,
                          color: chat.unreadCount > 0 ? AppColors.primary : Colors.grey,
                          fontWeight: chat.unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          chat.lastMessage?.content ?? chat.description ?? 'No messages yet',
                          style: TextStyle(
                            fontSize: 14,
                            color: chat.unreadCount > 0 
                                ? (isDark ? Colors.white : Colors.black) 
                                : Colors.grey,
                            fontWeight: chat.unreadCount > 0 ? FontWeight.w500 : FontWeight.normal,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (chat.unreadCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          constraints: const BoxConstraints(minWidth: 20),
                          child: Text(
                            chat.unreadCount.toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
