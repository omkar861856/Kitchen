import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginPage.css'
import { apiUrl } from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks/hooks';
import { setToken, login } from '../store/slices/authSlice';

const LoginForm = () => {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otpExpiry, setOtpExpiry] = useState('');
    const [otpCount, setOtpCount] = useState(0); // Tracks OTPs sent
    const [cooldown, setCooldown] = useState(0); // Cooldown period (seconds)
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const startCooldown = (duration: number) => {
        setCooldown(duration);
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev > 1) return prev - 1;
                clearInterval(interval);
                return 0;
            });
        }, 1000);
    };

    const onSendOtp = async (data: any) => {
        if (otpCount >= 3) {
            toast.error('Maximum OTP limit reached for 1 hour.');
            return;
        }

        if (cooldown > 0) {
            toast.info(`Please wait ${cooldown} seconds before requesting another OTP.`);
            return;
        }

        try {
            setPhoneNumber(data.phone);
            const response = await axios.post(`${apiUrl}/auth/signin/send-otp`, { phone: data.phone });

            if (!response.data.user.isKitchen) {

                toast.error("Login from kitchen account")

                return

            }

            if (response.data.message === 'Valid Token') {
                dispatch(login(response.data.user));
                toast.success('Login successful!');
                navigate('/');
                return;
            }

            setOtpExpiry(response.data.user.otpExpiresAt);
            setFirstName(response.data.user.firstName);
            setLastName(response.data.user.lastName);
            setIsOtpSent(true);
            toast.success('OTP sent successfully!');
            setOtpCount((prev) => prev + 1);

            if (otpCount === 0) {
                startCooldown(30); // 30 seconds cooldown for the first OTP
            } else if (otpCount === 1) {
                startCooldown(300); // 5 minutes cooldown for the second OTP
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                toast.error('No user found - Sign up');
                setTimeout(() => navigate('/signup'), 3000);
            }
            else if (err.response?.status == 403) {
                toast.error('User already has an active login');
            }
            else {
                toast.error('Failed to send OTP. Try again.');
            }
        }
    };

    const onVerifyOtp = async (data: any) => {
        try {
            const res = await axios.post(`${apiUrl}/auth/verify-otp`, { phone: phoneNumber, otp: data.otp });

            dispatch(setToken(res.data.token));
            dispatch(login({
                firstName,
                lastName,
                phone: phoneNumber,
                otp: data.otp,
                otpExpiresAt: otpExpiry,
                token: res.data.token,
                isLoggedIn: true,
                isKitchen: null,
                kitchenName: null,
                kitchenId: res.data.kitchenId,
                kitchenStatus: res.data.kitchenStatus
            }));
            navigate('/');
            toast.success('Login successful!');
            reset();
        } catch (err) {
            toast.error('Invalid OTP. Try again.');
        }
    };

    const resendOtp = () => {
        if (cooldown > 0) {
            toast.info(`Please wait ${cooldown} seconds before requesting another OTP.`);
            return;
        }

        onSendOtp({ phone: phoneNumber });
    };

    return (
        <div>
            <ToastContainer />
            <div className="form-container">
                <h4>Sign In</h4>
                <form onSubmit={handleSubmit(isOtpSent ? onVerifyOtp : onSendOtp)}>
                    {!isOtpSent && (
                        <>
                            <input
                                type="text"
                                placeholder="Phone Number (10 digit only)"
                                {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })}
                            />
                            {errors.phone && <p>Enter a valid phone number</p>}
                        </>
                    )}
                    {isOtpSent && (
                        <>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                {...register('otp', { required: true })}
                            />
                            {cooldown > 0 ? (
                                <p>Resend OTP in {cooldown} seconds</p>
                            ) : (
                                <button type="button" onClick={resendOtp}>Resend OTP</button>
                            )}
                        </>
                    )}
                    <button type="submit">{isOtpSent ? 'Verify OTP' : 'Sign In'}</button>
                </form>
                <h5>
                    <a id="signup" onClick={() => navigate('/signup')}>Sign up</a>
                    &nbsp;If you don't have an account.
                </h5>
            </div>
        </div>
    );
};

export default LoginForm;