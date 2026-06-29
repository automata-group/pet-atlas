import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../bloc/chat_room_bloc.dart';
import '../data/models/chat_group.dart';
import '../data/models/chat_message.dart';
import '../data/repositories/chat_repository.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/bloc/auth_bloc.dart';
import '../../../core/network/socket_service.dart';
import '../../../core/config/environment.dart';
import '../../../l10n/app_localizations.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:file_picker/file_picker.dart';

class ChatRoomScreen extends StatefulWidget {
  final ChatGroup chat;

  const ChatRoomScreen({super.key, required this.chat});

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final AudioRecorder _audioRecorder = AudioRecorder();
  final ImagePicker _picker = ImagePicker();
  
  bool _isRecording = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _audioRecorder.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source);
    if (!mounted) return;
    if (image != null) {
      context.read<ChatRoomBloc>().add(
        SendMediaMessage(widget.chat.id, image.path, 'Photo')
      );
    }
  }

  Future<void> _pickVideo(ImageSource source) async {
    final XFile? video = await _picker.pickVideo(source: source);
    if (!mounted) return;
    if (video != null) {
      context.read<ChatRoomBloc>().add(
        SendMediaMessage(widget.chat.id, video.path, 'Video')
      );
    }
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (!mounted) return;
    if (result != null) {
      context.read<ChatRoomBloc>().add(
        SendMediaMessage(widget.chat.id, result.files.single.path!, 'File')
      );
    }
  }

  Future<void> _toggleRecording() async {
    if (_isRecording) {
      final path = await _audioRecorder.stop();
      if (!mounted) return;
      setState(() => _isRecording = false);
      if (path != null) {
        context.read<ChatRoomBloc>().add(
          SendMediaMessage(widget.chat.id, path, 'Voice')
        );
      }
    } else {
      if (await _audioRecorder.hasPermission()) {
        if (!mounted) return;
        final directory = await getApplicationDocumentsDirectory();
        final path = '${directory.path}/recording_${DateTime.now().millisecondsSinceEpoch}.m4a';
        await _audioRecorder.start(const RecordConfig(), path: path);
        if (!mounted) return;
        setState(() => _isRecording = true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final socketService = RepositoryProvider.of<SocketService>(context);
        final String currentUserId = socketService.currentUserId ?? 
            (authState is AuthAuthenticated ? authState.userId.toString() : '');

        return BlocProvider(
          create: (context) => ChatRoomBloc(
            repository: RepositoryProvider.of<ChatRepository>(context),
            socketService: RepositoryProvider.of<SocketService>(context),
          )..add(LoadMessages(widget.chat.id)),
          child: Scaffold(
            backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
            appBar: AppBar(
              elevation: 1,
              backgroundColor: isDark ? const Color(0xFF0F1E23) : Colors.white,
              titleSpacing: 0,
              leading: IconButton(
                icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : Colors.black),
                onPressed: () => Navigator.pop(context),
              ),
              title: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: widget.chat.type == 'vet_consult' 
                        ? AppColors.primary.withValues(alpha: 0.1) 
                        : Colors.grey[200],
                    child: widget.chat.type == 'vet_consult'
                        ? const Icon(Icons.medical_services, color: AppColors.primary, size: 20)
                        : const Icon(Icons.person, color: Colors.grey, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.chat.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black,
                            fontSize: 16,
                          ),
                        ),
                        BlocBuilder<ChatRoomBloc, ChatRoomState>(
                          builder: (context, state) {
                            if (state is ChatRoomLoaded && state.roomStatus == 'archived') {
                              return Text(AppLocalizations.of(context)!.chatConsultationClosed, style: const TextStyle(color: Colors.grey, fontSize: 12));
                            }
                            if (state is ChatRoomLoaded && state.typingUsers.isNotEmpty) {
                              return const Text('typing...', style: TextStyle(color: AppColors.primary, fontSize: 12));
                            }
                            return Text(
                              widget.chat.type == 'vet_consult' ? 'Specialized Vet' : 'Community Room',
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            body: Column(
              children: [
                Expanded(
                  child: BlocConsumer<ChatRoomBloc, ChatRoomState>(
                    listener: (context, state) {
                      if (state is ChatRoomLoaded) {
                        _scrollToBottom();
                      }
                    },
                    builder: (context, state) {
                      if (state is ChatRoomLoading) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (state is ChatRoomError) {
                        return Center(child: Text(state.message));
                      } else if (state is ChatRoomLoaded) {
                        return ListView.builder(
                          controller: _scrollController,
                          reverse: true,
                          padding: const EdgeInsets.all(16),
                          itemCount: state.messages.length,
                          itemBuilder: (context, index) {
                            final message = state.messages[index];
                            final bool isMe = message.senderId == currentUserId;
                            final bool isSeen = state.seenMessages.containsKey(message.id);
                            
                            return _MessageBubble(
                              message: message, 
                              isMe: isMe, 
                              isSeen: isSeen,
                            );
                          },
                        );
                      }
                      return Container();
                    },
                  ),
                ),
                BlocBuilder<ChatRoomBloc, ChatRoomState>(
                  builder: (context, state) {
                    bool isArchived = false;
                    if (state is ChatRoomLoaded && state.roomStatus == 'archived') {
                      isArchived = true;
                    }

                    if (isArchived) {
                      return _buildArchivedBanner(isDark);
                    } else {
                      return _buildInputArea(
                        context, 
                        isDark, 
                        isReadOnly: widget.chat.type == 'announcement',
                        voiceOnly: false,
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildArchivedBanner(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      color: isDark ? const Color(0xFF16252A) : Colors.grey[100],
      child: SafeArea(
        child: Column(
          children: [
            const Icon(Icons.archive, color: Colors.grey, size: 32),
            const SizedBox(height: 8),
            const Text(
              'This consultation has been ended and archived.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(AppLocalizations.of(context)!.chatBackToConsultations, style: const TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea(BuildContext context, bool isDark, {bool isReadOnly = false, bool voiceOnly = false}) {
    if (isReadOnly) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        color: isDark ? const Color(0xFF16252A) : Colors.grey[100],
        child: const SafeArea(
          child: Center(child: Text('Read-only channel', style: TextStyle(color: Colors.grey))),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF16252A) : Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2)),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (!voiceOnly && !_isRecording) ...[
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                onPressed: () => _showAttachmentMenu(context, isDark),
              ),
            ],
            Expanded(
              child: _isRecording 
                ? _buildRecordingIndicator()
                : (voiceOnly 
                    ? Text(AppLocalizations.of(context)!.chatVoiceMessagesOnly, style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic))
                    : _buildTextField(context, isDark)),
            ),
            const SizedBox(width: 8),
            _buildActionButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildRecordingIndicator() {
    return FadeTransition(
      opacity: _pulseController,
      child: const Row(
        children: [
          Icon(Icons.mic, color: Colors.red, size: 20),
          SizedBox(width: 8),
          Text('Recording...', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildTextField(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? Colors.white10 : Colors.grey[100],
        borderRadius: BorderRadius.circular(24),
      ),
      child: TextField(
        controller: _messageController,
        style: TextStyle(color: isDark ? Colors.white : Colors.black, fontSize: 14),
        onChanged: (val) {
          final socketService = RepositoryProvider.of<SocketService>(context);
          socketService.sendTypingStatus(widget.chat.id, val.isNotEmpty);
          setState(() {});
        },
        decoration: const InputDecoration(
          hintText: 'Type a message...',
          hintStyle: TextStyle(color: Colors.grey),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildActionButton(BuildContext context) {
    final bool hasText = _messageController.text.trim().isNotEmpty;
    
    return GestureDetector(
      onTap: () {
        if (_isRecording) {
          _toggleRecording();
        } else if (hasText) {
          context.read<ChatRoomBloc>().add(
            SendMessage(widget.chat.id, _messageController.text.trim())
          );
          _messageController.clear();
          RepositoryProvider.of<SocketService>(context).sendTypingStatus(widget.chat.id, false);
          setState(() {});
        } else {
          _toggleRecording();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: _isRecording ? Colors.red : AppColors.primary,
          shape: BoxShape.circle,
        ),
        child: Icon(
          _isRecording ? Icons.stop : (hasText ? Icons.send : Icons.mic),
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  void _showAttachmentMenu(BuildContext context, bool isDark) {
    final isCommunity = widget.chat.type == 'community';
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF16252A) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: isCommunity
                  ? [
                      _buildAttachmentItem(Icons.video_library, 'Gallery Video', AppColors.blue500, () {
                        Navigator.pop(bottomSheetContext);
                        _pickVideo(ImageSource.gallery);
                      }),
                      _buildAttachmentItem(Icons.videocam, 'Camera Video', AppColors.purple500, () {
                        Navigator.pop(bottomSheetContext);
                        _pickVideo(ImageSource.camera);
                      }),
                    ]
                  : [
                      _buildAttachmentItem(Icons.image, 'Gallery', AppColors.blue500, () {
                        Navigator.pop(bottomSheetContext);
                        _pickImage(ImageSource.gallery);
                      }),
                      _buildAttachmentItem(Icons.camera_alt, 'Camera', AppColors.purple500, () {
                        Navigator.pop(bottomSheetContext);
                        _pickImage(ImageSource.camera);
                      }),
                      _buildAttachmentItem(Icons.description, 'File', AppColors.orange500, () {
                        Navigator.pop(bottomSheetContext);
                        _pickFile();
                      }),
                    ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttachmentItem(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  final bool isSeen;

  const _MessageBubble({required this.message, required this.isMe, this.isSeen = false});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isMe ? AppColors.primary : (isDark ? const Color(0xFF16252A) : Colors.white),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(isMe ? 16 : 0),
                bottomRight: Radius.circular(isMe ? 0 : 16),
              ),
            ),
            child: _buildContent(context, isDark),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(DateFormat('h:mm a').format(message.createdAt), style: const TextStyle(color: Colors.grey, fontSize: 10)),
              if (isMe && isSeen) ...[
                const SizedBox(width: 4),
                const Icon(Icons.done_all, color: AppColors.primary, size: 12),
              ]
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, bool isDark) {
    String? mediaUrl = message.photoUrl ?? message.voiceUrl ?? message.videoUrl;
    if (mediaUrl != null && mediaUrl.startsWith('/')) {
      mediaUrl = '${Environment.localBaseUrl}$mediaUrl';
    }

    if (message.type == 'Photo') {
      if (mediaUrl == null) {
        return const SizedBox(
          width: 150,
          height: 150,
          child: Center(
            child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        );
      }
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(mediaUrl, errorBuilder: (c, e, s) => const Icon(Icons.broken_image)),
      );
    } else if (message.type == 'Voice') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.play_circle_fill, color: isMe ? Colors.white : AppColors.primary, size: 30),
          const SizedBox(width: 8),
          Text(AppLocalizations.of(context)!.chatVoiceMessage, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        ],
      );
    } else if (message.type == 'Video') {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 200,
          height: 120,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isMe
                  ? [const Color(0xFF00b0f0), const Color(0xFF0083B0)]
                  : [const Color(0xFF1F353E), const Color(0xFF0F1E23)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Positioned(
                right: -20,
                bottom: -20,
                child: Icon(
                  Icons.videocam,
                  size: 100,
                  color: Colors.white.withValues(alpha: 0.05),
                ),
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.play_arrow_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    message.content.endsWith('Video') || message.content.isEmpty
                        ? 'Video Message'
                        : message.content,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    } else if (message.type == 'File') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.description, color: isMe ? Colors.white : AppColors.primary),
          const SizedBox(width: 8),
          Flexible(child: Text(message.content, style: TextStyle(color: isMe ? Colors.white : Colors.black))),
        ],
      );
    }

    return Text(
      message.content,
      style: TextStyle(color: isMe ? Colors.white : (isDark ? Colors.white : Colors.black87), fontSize: 14),
    );
  }
}
