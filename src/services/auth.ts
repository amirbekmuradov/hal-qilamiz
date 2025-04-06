import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut,
    sendEmailVerification,
    updateProfile,
    PhoneAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    UserCredential
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  
  export interface RegisterParams {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }
  
  // Initialize recaptcha verifier for phone authentication
  let recaptchaVerifier: RecaptchaVerifier | null = null;
  
  const initRecaptcha = (elementId: string) => {
    if (typeof window !== 'undefined') {
      recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        'size': 'invisible',
      });
    }
  };
  
  // Register new user with email and password
  const registerWithEmail = async ({ email, password, firstName, lastName }: RegisterParams): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Send verification code to phone
  const sendPhoneVerification = async (phoneNumber: string, elementId: string): Promise<any> => {
    try {
      initRecaptcha(elementId);
      if (recaptchaVerifier) {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
      }
      throw new Error('Recaptcha not initialized');
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    }
  };
  
  // Verify phone code
  const verifyPhoneCode = async (confirmationResult: any, code: string): Promise<UserCredential> => {
    try {
      return await confirmationResult.confirm(code);
    } catch (error) {
      console.error('Code verification error:', error);
      throw error;
    }
  };
  
  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };
  
  // Get current user
  const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  export {
    registerWithEmail,
    signInWithEmail,
    sendPhoneVerification,
    verifyPhoneCode,
    signOut,
    getCurrentUser
  };