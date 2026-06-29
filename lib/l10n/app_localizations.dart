import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale) : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en')
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Pet-Atlas'**
  String get appTitle;

  /// No description provided for @heroTitle.
  ///
  /// In en, this message translates to:
  /// **'Everything your pet needs, in one place.'**
  String get heroTitle;

  /// No description provided for @heroSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Find trusted professionals near you.'**
  String get heroSubtitle;

  /// No description provided for @homeVisitTitle.
  ///
  /// In en, this message translates to:
  /// **'Need a Home Visit?'**
  String get homeVisitTitle;

  /// No description provided for @homeVisitSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Professional vets right at your door'**
  String get homeVisitSubtitle;

  /// No description provided for @searchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search for clinics, vets, or food'**
  String get searchPlaceholder;

  /// No description provided for @servicesTitle.
  ///
  /// In en, this message translates to:
  /// **'Our Services'**
  String get servicesTitle;

  /// No description provided for @seeAll.
  ///
  /// In en, this message translates to:
  /// **'See All'**
  String get seeAll;

  /// No description provided for @serviceClinics.
  ///
  /// In en, this message translates to:
  /// **'Clinics'**
  String get serviceClinics;

  /// No description provided for @serviceVets.
  ///
  /// In en, this message translates to:
  /// **'Vets'**
  String get serviceVets;

  /// No description provided for @serviceGrooming.
  ///
  /// In en, this message translates to:
  /// **'Grooming'**
  String get serviceGrooming;

  /// No description provided for @servicePetCare.
  ///
  /// In en, this message translates to:
  /// **'Pet Care'**
  String get servicePetCare;

  /// No description provided for @blogTitle.
  ///
  /// In en, this message translates to:
  /// **'Articles'**
  String get blogTitle;

  /// No description provided for @tagDog.
  ///
  /// In en, this message translates to:
  /// **'Dog'**
  String get tagDog;

  /// No description provided for @tagCat.
  ///
  /// In en, this message translates to:
  /// **'Cat'**
  String get tagCat;

  /// No description provided for @tagExotic.
  ///
  /// In en, this message translates to:
  /// **'Exotic'**
  String get tagExotic;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navVetChat.
  ///
  /// In en, this message translates to:
  /// **'VetChat'**
  String get navVetChat;

  /// No description provided for @navDiscounts.
  ///
  /// In en, this message translates to:
  /// **'Discounts'**
  String get navDiscounts;

  /// No description provided for @navLists.
  ///
  /// In en, this message translates to:
  /// **'Lists'**
  String get navLists;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @blogPost1Title.
  ///
  /// In en, this message translates to:
  /// **'5 Tips for Summer Hydration in Larger Breeds'**
  String get blogPost1Title;

  /// No description provided for @blogPost1Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Keep your furry friend cool this August...'**
  String get blogPost1Subtitle;

  /// No description provided for @blogPost2Title.
  ///
  /// In en, this message translates to:
  /// **'Caring for your Reptile during Winter'**
  String get blogPost2Title;

  /// No description provided for @blogPost2Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Essential heating and humidity tips...'**
  String get blogPost2Subtitle;

  /// No description provided for @authLogin.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get authLogin;

  /// No description provided for @authRegister.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get authRegister;

  /// No description provided for @authUsername.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get authUsername;

  /// No description provided for @authEmail.
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get authEmail;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get authConfirmPassword;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authForgotPassword;

  /// No description provided for @authDontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get authDontHaveAccount;

  /// No description provided for @authAlreadyHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get authAlreadyHaveAccount;

  /// No description provided for @blogReadMore.
  ///
  /// In en, this message translates to:
  /// **'Read More'**
  String get blogReadMore;

  /// No description provided for @blogAuthorPrefix.
  ///
  /// In en, this message translates to:
  /// **'By'**
  String get blogAuthorPrefix;

  /// No description provided for @blogPopular.
  ///
  /// In en, this message translates to:
  /// **'Popular'**
  String get blogPopular;

  /// No description provided for @blogRecent.
  ///
  /// In en, this message translates to:
  /// **'Recent'**
  String get blogRecent;

  /// No description provided for @profileSavedBlogs.
  ///
  /// In en, this message translates to:
  /// **'Saved Blogs'**
  String get profileSavedBlogs;

  /// No description provided for @profileSecurity.
  ///
  /// In en, this message translates to:
  /// **'Security Settings'**
  String get profileSecurity;

  /// No description provided for @profileSubscription.
  ///
  /// In en, this message translates to:
  /// **'Subscription Settings'**
  String get profileSubscription;

  /// No description provided for @profileChangePassword.
  ///
  /// In en, this message translates to:
  /// **'Change Password'**
  String get profileChangePassword;

  /// No description provided for @profileEnable2FA.
  ///
  /// In en, this message translates to:
  /// **'Enable Two-Factor Authentication'**
  String get profileEnable2FA;

  /// No description provided for @profileCurrentPlan.
  ///
  /// In en, this message translates to:
  /// **'Current Plan: Free'**
  String get profileCurrentPlan;

  /// No description provided for @profileUpgradePlan.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to Premium'**
  String get profileUpgradePlan;

  /// No description provided for @profileNoSavedBlogs.
  ///
  /// In en, this message translates to:
  /// **'You have no saved blogs yet.'**
  String get profileNoSavedBlogs;

  /// No description provided for @errEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Email is required'**
  String get errEmailRequired;

  /// No description provided for @errEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email address'**
  String get errEmailInvalid;

  /// No description provided for @errPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get errPasswordRequired;

  /// No description provided for @errPasswordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters long'**
  String get errPasswordTooShort;

  /// No description provided for @errConfirmPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Confirm password is required'**
  String get errConfirmPasswordRequired;

  /// No description provided for @errPasswordsDoNotMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get errPasswordsDoNotMatch;

  /// No description provided for @errUsernameRequired.
  ///
  /// In en, this message translates to:
  /// **'Username is required'**
  String get errUsernameRequired;

  /// No description provided for @errUsernameTooShort.
  ///
  /// In en, this message translates to:
  /// **'Username must be at least 3 characters long'**
  String get errUsernameTooShort;

  /// No description provided for @errInvalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Invalid username or password'**
  String get errInvalidCredentials;

  /// No description provided for @errEmailExists.
  ///
  /// In en, this message translates to:
  /// **'This email is already registered'**
  String get errEmailExists;

  /// No description provided for @errUsernameExists.
  ///
  /// In en, this message translates to:
  /// **'This username is already taken'**
  String get errUsernameExists;

  /// No description provided for @errInvalidEmailFormat.
  ///
  /// In en, this message translates to:
  /// **'The email format is invalid'**
  String get errInvalidEmailFormat;

  /// No description provided for @errGenericServer.
  ///
  /// In en, this message translates to:
  /// **'A server error occurred, please try again later'**
  String get errGenericServer;

  /// No description provided for @errUnauthorized.
  ///
  /// In en, this message translates to:
  /// **'You are not authorized to perform this action'**
  String get errUnauthorized;

  /// No description provided for @errForbidden.
  ///
  /// In en, this message translates to:
  /// **'Access denied. Check site security settings'**
  String get errForbidden;

  /// No description provided for @authLoginSuccess.
  ///
  /// In en, this message translates to:
  /// **'Login successful! Welcome back.'**
  String get authLoginSuccess;

  /// No description provided for @authRegisterSuccess.
  ///
  /// In en, this message translates to:
  /// **'Registration successful! Welcome to Pet Atlas.'**
  String get authRegisterSuccess;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get authLogout;

  /// No description provided for @gallery.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get gallery;

  /// No description provided for @serviceMenu.
  ///
  /// In en, this message translates to:
  /// **'Service Menu'**
  String get serviceMenu;

  /// No description provided for @scheduleAppointment.
  ///
  /// In en, this message translates to:
  /// **'Schedule Appointment'**
  String get scheduleAppointment;

  /// No description provided for @aboutClinic.
  ///
  /// In en, this message translates to:
  /// **'About Clinic'**
  String get aboutClinic;

  /// No description provided for @reviews.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get reviews;

  /// No description provided for @location.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get location;

  /// No description provided for @chatNow.
  ///
  /// In en, this message translates to:
  /// **'Chat Now'**
  String get chatNow;

  /// No description provided for @directions.
  ///
  /// In en, this message translates to:
  /// **'Directions'**
  String get directions;

  /// No description provided for @bookVisit.
  ///
  /// In en, this message translates to:
  /// **'Book Visit'**
  String get bookVisit;

  /// No description provided for @priceRange.
  ///
  /// In en, this message translates to:
  /// **'Price Range'**
  String get priceRange;

  /// No description provided for @requestConsultation.
  ///
  /// In en, this message translates to:
  /// **'Request a Consultation'**
  String get requestConsultation;

  /// No description provided for @consultationSection.
  ///
  /// In en, this message translates to:
  /// **'Professional Consultation'**
  String get consultationSection;

  /// No description provided for @profileEditProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get profileEditProfile;

  /// No description provided for @profileMyPets.
  ///
  /// In en, this message translates to:
  /// **'My Pets'**
  String get profileMyPets;

  /// No description provided for @profileAddPet.
  ///
  /// In en, this message translates to:
  /// **'Add Pet'**
  String get profileAddPet;

  /// No description provided for @profileTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get profileTryAgain;

  /// No description provided for @profileSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get profileSave;

  /// No description provided for @profileSex.
  ///
  /// In en, this message translates to:
  /// **'Sex'**
  String get profileSex;

  /// No description provided for @homeOfficialOnly.
  ///
  /// In en, this message translates to:
  /// **'Official Only'**
  String get homeOfficialOnly;

  /// No description provided for @homeOfficialSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Only show official partners'**
  String get homeOfficialSubtitle;

  /// No description provided for @homePriceRange.
  ///
  /// In en, this message translates to:
  /// **'Price Range'**
  String get homePriceRange;

  /// No description provided for @homeSortBy.
  ///
  /// In en, this message translates to:
  /// **'Sort By'**
  String get homeSortBy;

  /// No description provided for @homeNearest.
  ///
  /// In en, this message translates to:
  /// **'Nearest'**
  String get homeNearest;

  /// No description provided for @homeTopRated.
  ///
  /// In en, this message translates to:
  /// **'Top Rated'**
  String get homeTopRated;

  /// No description provided for @dirSpecialties.
  ///
  /// In en, this message translates to:
  /// **'Specialties'**
  String get dirSpecialties;

  /// No description provided for @dirLanguagesSpoken.
  ///
  /// In en, this message translates to:
  /// **'Languages Spoken'**
  String get dirLanguagesSpoken;

  /// No description provided for @dirSelectPetSize.
  ///
  /// In en, this message translates to:
  /// **'Select Pet Size'**
  String get dirSelectPetSize;

  /// No description provided for @dirInsurancePlans.
  ///
  /// In en, this message translates to:
  /// **'Insurance Plans'**
  String get dirInsurancePlans;

  /// No description provided for @dirRequestInformation.
  ///
  /// In en, this message translates to:
  /// **'Request Information'**
  String get dirRequestInformation;

  /// No description provided for @dirAvailableCategories.
  ///
  /// In en, this message translates to:
  /// **'Available Categories'**
  String get dirAvailableCategories;

  /// No description provided for @dirVisitOnlineStore.
  ///
  /// In en, this message translates to:
  /// **'Visit Online Store'**
  String get dirVisitOnlineStore;

  /// No description provided for @dirRequestInsuranceQuote.
  ///
  /// In en, this message translates to:
  /// **'Request Insurance Quote'**
  String get dirRequestInsuranceQuote;

  /// No description provided for @dirCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get dirCancel;

  /// No description provided for @dirSubmitRequest.
  ///
  /// In en, this message translates to:
  /// **'Submit Request'**
  String get dirSubmitRequest;

  /// No description provided for @dirConfirmBooking.
  ///
  /// In en, this message translates to:
  /// **'Confirm Booking'**
  String get dirConfirmBooking;

  /// No description provided for @dirAppointmentType.
  ///
  /// In en, this message translates to:
  /// **'Appointment Type'**
  String get dirAppointmentType;

  /// No description provided for @dirSelectPet.
  ///
  /// In en, this message translates to:
  /// **'Select Pet'**
  String get dirSelectPet;

  /// No description provided for @dirSelectDate.
  ///
  /// In en, this message translates to:
  /// **'Select Date'**
  String get dirSelectDate;

  /// No description provided for @dirSummary.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get dirSummary;

  /// No description provided for @dirTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get dirTotal;

  /// No description provided for @chatConsultationClosed.
  ///
  /// In en, this message translates to:
  /// **'Consultation Closed'**
  String get chatConsultationClosed;

  /// No description provided for @chatBackToConsultations.
  ///
  /// In en, this message translates to:
  /// **'Back to consultations'**
  String get chatBackToConsultations;

  /// No description provided for @chatVoiceMessagesOnly.
  ///
  /// In en, this message translates to:
  /// **'Voice messages only'**
  String get chatVoiceMessagesOnly;

  /// No description provided for @chatVoiceMessage.
  ///
  /// In en, this message translates to:
  /// **'Voice message'**
  String get chatVoiceMessage;

  /// No description provided for @bookingMyAppointments.
  ///
  /// In en, this message translates to:
  /// **'My Appointments'**
  String get bookingMyAppointments;

  /// No description provided for @bookingNoAppointmentsYet.
  ///
  /// In en, this message translates to:
  /// **'No appointments yet'**
  String get bookingNoAppointmentsYet;

  /// No description provided for @bookingServices.
  ///
  /// In en, this message translates to:
  /// **'Services'**
  String get bookingServices;

  /// No description provided for @bookingBookAppointment.
  ///
  /// In en, this message translates to:
  /// **'Book Appointment'**
  String get bookingBookAppointment;

  /// No description provided for @bookingServiceType.
  ///
  /// In en, this message translates to:
  /// **'Service Type'**
  String get bookingServiceType;

  /// No description provided for @bookingAvailableSlots.
  ///
  /// In en, this message translates to:
  /// **'Available Slots'**
  String get bookingAvailableSlots;

  /// No description provided for @bookingProceedToPayment.
  ///
  /// In en, this message translates to:
  /// **'Proceed to Payment'**
  String get bookingProceedToPayment;

  /// No description provided for @bookingPaymentSummary.
  ///
  /// In en, this message translates to:
  /// **'Payment Summary'**
  String get bookingPaymentSummary;

  /// No description provided for @bookingTotalAmount.
  ///
  /// In en, this message translates to:
  /// **'Total Amount'**
  String get bookingTotalAmount;

  /// No description provided for @authSecurityVerificationRequired.
  ///
  /// In en, this message translates to:
  /// **'Security Verification Required'**
  String get authSecurityVerificationRequired;

  /// No description provided for @authOpenVerificationInNewTab.
  ///
  /// In en, this message translates to:
  /// **'Open Verification in New Tab'**
  String get authOpenVerificationInNewTab;

  /// No description provided for @profileCompleteProfile.
  ///
  /// In en, this message translates to:
  /// **'Complete Your Profile'**
  String get profileCompleteProfile;

  /// No description provided for @profileCompleteProfileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Add your mobile number and address for a better experience.'**
  String get profileCompleteProfileSubtitle;

  /// No description provided for @profileUpdatedSuccessfully.
  ///
  /// In en, this message translates to:
  /// **'Profile updated successfully!'**
  String get profileUpdatedSuccessfully;

  /// No description provided for @profilePersonalInfo.
  ///
  /// In en, this message translates to:
  /// **'Personal Information'**
  String get profilePersonalInfo;

  /// No description provided for @profileFirstName.
  ///
  /// In en, this message translates to:
  /// **'First Name'**
  String get profileFirstName;

  /// No description provided for @profileLastName.
  ///
  /// In en, this message translates to:
  /// **'Last Name'**
  String get profileLastName;

  /// No description provided for @profileContactDetails.
  ///
  /// In en, this message translates to:
  /// **'Contact Details'**
  String get profileContactDetails;

  /// No description provided for @profileMobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Mobile Number'**
  String get profileMobileNumber;

  /// No description provided for @profileAddress.
  ///
  /// In en, this message translates to:
  /// **'Address'**
  String get profileAddress;

  /// No description provided for @profileCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get profileCity;

  /// No description provided for @profileCountry.
  ///
  /// In en, this message translates to:
  /// **'Country'**
  String get profileCountry;
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {


  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar': return AppLocalizationsAr();
    case 'en': return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.'
  );
}
