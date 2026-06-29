import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/config/environment.dart';
import 'package:translator/translator.dart';

// Models
class BlogPost {
  final String imageUrl;
  final String tag;
  final String title;
  final String subtitle;
  final String author;
  final String date;
  final String content;

  BlogPost({
    required this.imageUrl,
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.author,
    required this.date,
    required this.content,
  });
}

// Events
abstract class BlogEvent {}

class LoadBlogsEvent extends BlogEvent {
  final String locale;
  final bool refresh;
  LoadBlogsEvent({required this.locale, this.refresh = false});
}

class LoadMoreBlogsEvent extends BlogEvent {
  final String locale;
  LoadMoreBlogsEvent({required this.locale});
}

class FilterBlogsEvent extends BlogEvent {
  final String tag;
  FilterBlogsEvent({required this.tag});
}

class SearchBlogsEvent extends BlogEvent {
  final String query;
  SearchBlogsEvent({required this.query});
}

// States
abstract class BlogState {}

class BlogInitial extends BlogState {}

class BlogLoading extends BlogState {}

class BlogLoaded extends BlogState {
  final List<BlogPost> allPosts;
  final List<BlogPost> filteredPosts;
  final String? activeFilter;
  final String searchQuery;
  final int currentPage;
  final bool hasReachedMax;
  final bool isLoadingMore;
  final int loadingCount;

  List<BlogPost> get posts => filteredPosts;

  BlogLoaded({
    required this.allPosts,
    required this.filteredPosts,
    this.activeFilter,
    this.searchQuery = '',
    this.currentPage = 1,
    this.hasReachedMax = false,
    this.isLoadingMore = false,
    this.loadingCount = 0,
  });

  BlogLoaded copyWith({
    List<BlogPost>? allPosts,
    List<BlogPost>? filteredPosts,
    String? activeFilter,
    String? searchQuery,
    int? currentPage,
    bool? hasReachedMax,
    bool? isLoadingMore,
    int? loadingCount,
  }) {
    return BlogLoaded(
      allPosts: allPosts ?? this.allPosts,
      filteredPosts: filteredPosts ?? this.filteredPosts,
      activeFilter: activeFilter ?? this.activeFilter,
      searchQuery: searchQuery ?? this.searchQuery,
      currentPage: currentPage ?? this.currentPage,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      loadingCount: loadingCount ?? this.loadingCount,
    );
  }
}

class BlogError extends BlogState {
  final String message;
  BlogError({required this.message});
}

// BLoC
class BlogBloc extends Bloc<BlogEvent, BlogState> {
  BlogBloc() : super(BlogInitial()) {
    on<LoadBlogsEvent>((event, emit) async {
      emit(BlogLoading());
      try {
        final response = await _fetchFromApi(1);
        final translator = GoogleTranslator();
        List<BlogPost> translatedPosts = [];

        Future<BlogPost> translatePost(dynamic post) async {
          try {
            var titleText = post.title;
            var subtitleText = post.subtitle;
            var contentText = post.content;

            try { titleText = (await translator.translate(post.title, to: event.locale)).text; } catch (e) {}
            try { subtitleText = (await translator.translate(post.subtitle, to: event.locale)).text; } catch (e) {}
            try { contentText = (await translator.translate(post.content, to: event.locale)).text; } catch (e) {}
            
            return BlogPost(
              imageUrl: Uri.encodeFull(post.imageUrl),
              tag: post.tag,
              title: titleText,
              subtitle: subtitleText,
              author: post.author,
              date: post.date,
              content: contentText,
            );
          } catch (e) {
            return BlogPost(
              imageUrl: Uri.encodeFull(post.imageUrl),
              tag: post.tag,
              title: post.title,
              subtitle: post.subtitle,
              author: post.author,
              date: post.date,
              content: post.content,
            );
          }
        }

        final streamController = StreamController<BlogPost>();
        
        for (var post in response) {
          translatePost(post).then((translatedPost) {
            if (!streamController.isClosed) streamController.add(translatedPost);
          });
        }

        Future.wait(response.map((p) => translatePost(p))).whenComplete(() {
          if (!streamController.isClosed) streamController.close();
        });

        // Emit initial skeletons before translation completes
        emit(BlogLoaded(
          allPosts: [],
          filteredPosts: [],
          currentPage: 1,
          hasReachedMax: false,
          isLoadingMore: true,
          loadingCount: response.length,
        ));

        await emit.forEach(
          streamController.stream,
          onData: (BlogPost translatedPost) {
            translatedPosts = List.from(translatedPosts)..add(translatedPost);
            return BlogLoaded(
              allPosts: translatedPosts,
              filteredPosts: translatedPosts,
              currentPage: 1,
              hasReachedMax: response.length < 10 && translatedPosts.length == response.length,
              isLoadingMore: translatedPosts.length < response.length,
              loadingCount: response.length - translatedPosts.length,
            );
          },
        );
      } catch (e) {
        emit(BlogError(message: 'Failed to load blogs. Please check your internet connection.'));
      }
    });

    on<LoadMoreBlogsEvent>((event, emit) async {
      final currentState = state;
      if (currentState is BlogLoaded && !currentState.hasReachedMax && !currentState.isLoadingMore) {
        emit(currentState.copyWith(isLoadingMore: true));
        try {
          final nextPage = currentState.currentPage + 1;
          final response = await _fetchFromApi(nextPage);
          
          if (response.isEmpty) {
            emit(currentState.copyWith(hasReachedMax: true, isLoadingMore: false));
            return;
          }

          final translator = GoogleTranslator();

          Future<BlogPost> translatePost(dynamic post) async {
            try {
              var titleText = post.title;
              var subtitleText = post.subtitle;
              var contentText = post.content;

              try { titleText = (await translator.translate(post.title, to: event.locale)).text; } catch (e) {}
              try { subtitleText = (await translator.translate(post.subtitle, to: event.locale)).text; } catch (e) {}
              try { contentText = (await translator.translate(post.content, to: event.locale)).text; } catch (e) {}
              
              return BlogPost(
                imageUrl: Uri.encodeFull(post.imageUrl),
                tag: post.tag,
                title: titleText,
                subtitle: subtitleText,
                author: post.author,
                date: post.date,
                content: contentText,
              );
            } catch (e) {
              return BlogPost(
                imageUrl: Uri.encodeFull(post.imageUrl),
                tag: post.tag,
                title: post.title,
                subtitle: post.subtitle,
                author: post.author,
                date: post.date,
                content: post.content,
              );
            }
          }

          final streamController = StreamController<BlogPost>();
          List<BlogPost> translatedBatch = [];
          
          for (var post in response) {
            translatePost(post).then((translatedPost) {
              if (!streamController.isClosed) streamController.add(translatedPost);
            });
          }

          Future.wait(response.map((p) => translatePost(p))).whenComplete(() {
            if (!streamController.isClosed) streamController.close();
          });

          emit(currentState.copyWith(
            isLoadingMore: true,
            loadingCount: response.length,
          ));

          await emit.forEach(
            streamController.stream,
            onData: (BlogPost translatedPost) {
              translatedBatch = List.from(translatedBatch)..add(translatedPost);
              final newAllPosts = List<BlogPost>.from(currentState.allPosts)..add(translatedPost);
              final filtered = _applyFilterAndSearch(newAllPosts, currentState.activeFilter, currentState.searchQuery);

              return currentState.copyWith(
                allPosts: newAllPosts,
                filteredPosts: filtered,
                currentPage: nextPage,
                hasReachedMax: response.length < 10 && translatedBatch.length == response.length,
                isLoadingMore: translatedBatch.length < response.length,
                loadingCount: response.length - translatedBatch.length,
              );
            },
          );
        } catch (e) {
          emit(currentState.copyWith(isLoadingMore: false));
        }
      }
    });

    on<FilterBlogsEvent>((event, emit) {
      final currentState = state;
      if (currentState is BlogLoaded) {
        final filter = event.tag.toLowerCase() == 'all' ? null : event.tag;
        final filtered = _applyFilterAndSearch(currentState.allPosts, filter, currentState.searchQuery);
        
        emit(currentState.copyWith(
          filteredPosts: filtered,
          activeFilter: filter,
        ));
      }
    });

    on<SearchBlogsEvent>((event, emit) {
      final currentState = state;
      if (currentState is BlogLoaded) {
        final filtered = _applyFilterAndSearch(currentState.allPosts, currentState.activeFilter, event.query);
        
        emit(currentState.copyWith(
          filteredPosts: filtered,
          searchQuery: event.query,
        ));
      }
    });
  }

  List<BlogPost> _applyFilterAndSearch(List<BlogPost> posts, String? tag, String query) {
    return posts.where((post) {
      bool matchesTag = false;
      if (tag == null || tag.isEmpty || tag.toLowerCase() == 'all') {
        matchesTag = true;
      } else {
        final t = tag.toLowerCase();
        final title = post.title.toLowerCase();
        final content = post.content.toLowerCase();
        final pTag = post.tag.toLowerCase();

        if (pTag.contains(t) || t.contains(pTag)) {
          matchesTag = true;
        } else if (t == 'dog' && (title.contains('dog') || title.contains('كلب') || title.contains('كلاب') || content.contains('dog') || content.contains('كلب') || content.contains('كلاب'))) {
          matchesTag = true;
        } else if (t == 'cat' && (title.contains('cat') || title.contains('قطط') || title.contains('قطة') || content.contains('cat') || content.contains('قطط') || content.contains('قطة'))) {
          matchesTag = true;
        } else if (t == 'exotic' && (title.contains('exotic') || title.contains('غريب') || title.contains('طيور') || content.contains('exotic') || content.contains('غريب'))) {
          matchesTag = true;
        }
      }

      final matchesSearch = query.isEmpty || 
          post.title.toLowerCase().contains(query.toLowerCase()) || 
          post.subtitle.toLowerCase().contains(query.toLowerCase()) ||
          post.content.toLowerCase().contains(query.toLowerCase());
          
      return matchesTag && matchesSearch;
    }).toList();
  }

  Future<List<BlogPost>> _fetchFromApi(int page) async {
    final response = await Dio().get('${Environment.localBaseUrl}/blog?page=$page');
    final data = response.data as List;

    return data.map((item) => BlogPost(
      imageUrl: Uri.encodeFull(item['imageUrl'] ?? ''),
      tag: item['tag'] ?? 'General',
      title: item['title'] ?? '',
      subtitle: item['subtitle'] ?? '',
      author: item['author'] ?? 'Admin',
      date: item['date'] ?? '',
      content: item['content'] ?? '',
    )).toList();
  }
}
