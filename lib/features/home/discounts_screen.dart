import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_colors.dart';
import '../profile/bloc/subscription_cubit.dart';
import '../profile/presentation/paywall_screen.dart';

class DiscountsScreen extends StatelessWidget {
  const DiscountsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SubscriptionCubit, SubscriptionState>(
      builder: (context, subState) {
        final isActive = subState.status?.isActive ?? false;
        if (subState.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
          );
        }
        if (!isActive) {
          return const PaywallScreen();
        }

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Exclusive Offers',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Special discounts for your beloved pets',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 24),
                      _buildDiscountCard(
                        'Vet Checkup',
                        '20% OFF',
                        'Get a comprehensive health check for your cat or dog.',
                        'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=400&auto=format&fit=crop',
                        const Color(0xFF2DD4BF),
                      ),
                      const SizedBox(height: 16),
                      _buildDiscountCard(
                        'Grooming Bundle',
                        'BUY 1 GET 1',
                        'Full spa treatment including bath, hair cut, and nail trimming.',
                        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=400&auto=format&fit=crop',
                        const Color(0xFF0EA5E9),
                      ),
                      const SizedBox(height: 16),
                      _buildDiscountCard(
                        'Pet Food Promo',
                        'SAVE \$10',
                        'On all premium dry food bags over 5kg.',
                        'https://images.unsplash.com/photo-1589924691106-073b19f5538d?q=80&w=400&auto=format&fit=crop',
                        const Color(0xFFF59E0B),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDiscountCard(String title, String discount, String desc, String imageUrl, Color accent) {
    return Container(
      width: double.infinity,
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        image: DecorationImage(
          image: NetworkImage(imageUrl),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(Colors.black.withValues(alpha: 0.5), BlendMode.darken),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: accent,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  bottomLeft: Radius.circular(20),
                ),
              ),
              child: Text(
                discount,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
