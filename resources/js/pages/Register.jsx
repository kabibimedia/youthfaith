import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

export default function Register() {
    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [othername, setOthername] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [location, setLocation] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [isMember, setIsMember] = useState(null);
    const [hasDuesCard, setHasDuesCard] = useState(null);
    const [duesCardCode, setDuesCardCode] = useState('');
    const [registered, setRegistered] = useState(false);
    const [hasRegistrationPhoto, setHasRegistrationPhoto] = useState(false);
    const { register, user, setUser } = useAuth();
    const navigate = useNavigate();

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('surname', surname);
            fd.append('firstname', firstname);
            if (othername) fd.append('othername', othername);
            if (username) fd.append('username', username);
            fd.append('email', email);
            if (dateOfBirth) fd.append('date_of_birth', dateOfBirth);
            if (location) fd.append('location', location);
            fd.append('password', password);
            fd.append('password_confirmation', passwordConfirmation);
            fd.append('is_member', isMember ? '1' : '0');
            fd.append('has_dues_card', hasDuesCard ? '1' : '0');
            if (hasDuesCard && duesCardCode) fd.append('dues_card_code', duesCardCode.toUpperCase());
            if (photo) fd.append('registration_photo', photo);
            await register(fd);
            setHasRegistrationPhoto(!!photo);
            setRegistered(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const usePhotoAsAvatar = async () => {
        try {
            await userService.useRegistrationPhoto();
            const res = await userService.getUser(user.id);
            setUser(res.data);
            navigate('/');
        } catch (err) {
            console.error(err);
            navigate('/');
        }
    };

    if (registered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
                    <p className="text-gray-500 mb-8">Your account has been created successfully.</p>
                    {hasRegistrationPhoto ? (
                        <div className="space-y-4">
                            <p className="text-gray-600">Would you like to use your registration photo as your profile picture?</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={usePhotoAsAvatar} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all">
                                    Yes, use it
                                </button>
                                <button onClick={() => navigate('/')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
                                    Skip, set later
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all">
                            Go to Feed
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>

                <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Join Us</h1>
                        <p className="text-gray-500 mt-2">Create your account and grow in faith together</p>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required
                                    placeholder="Surname"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required
                                    placeholder="First name"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Other Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                <input type="text" value={othername} onChange={(e) => setOthername(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username (optional)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Choose a username"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎂</span>
                                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                        placeholder="City, Country"
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                                    placeholder="At least 8 characters"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔐</span>
                                <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required
                                    placeholder="Confirm your password"
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 transition-all" />
                            </div>
                        </div>
                        <button type="button" onClick={() => setStep(2)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all text-lg flex items-center justify-center gap-2">
                            Continue →
                        </button>
                    </form>
                    <p className="text-center mt-8 text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-600 font-bold hover:text-pink-600 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>

            <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
                        <span className="text-3xl">📸</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Almost there!</h2>
                    <p className="text-gray-500 mt-2">Set up your account and add a photo</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Upload Photo <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-4">
                            <div className={`w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed shrink-0 ${photoPreview ? 'border-purple-500' : 'border-red-300'}`}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-gray-400">📷</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input type="file" accept="image/*" onChange={handlePhoto} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                <p className="text-xs text-gray-400 mt-1">Max 5MB. This will be used for identification.</p>
                            </div>
                        </div>
                        {!photo && <p className="text-xs text-red-500 mt-1">A photo is required</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Are you a youth member?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => { setIsMember(true); setHasDuesCard(null); }}
                                className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                    isMember === true
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 text-gray-600 hover:border-purple-200'
                                }`}>
                                <div className="text-2xl mb-1">✅</div>
                                Yes, I'm a member
                            </button>
                            <button type="button" onClick={() => { setIsMember(false); setHasDuesCard(false); }}
                                className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                    isMember === false
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 text-gray-600 hover:border-purple-200'
                                }`}>
                                <div className="text-2xl mb-1">🆕</div>
                                Not yet a member
                            </button>
                        </div>
                    </div>

                    {isMember === true && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Do you have a dues card?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setHasDuesCard(true)}
                                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                        hasDuesCard === true
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 text-gray-600 hover:border-purple-200'
                                    }`}>
                                    <div className="text-2xl mb-1">🪪</div>
                                    Yes, I have one
                                </button>
                                <button type="button" onClick={() => setHasDuesCard(false)}
                                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                                        hasDuesCard === false
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 text-gray-600 hover:border-purple-200'
                                    }`}>
                                    <div className="text-2xl mb-1">🔖</div>
                                    No, generate one
                                </button>
                            </div>
                        </div>
                    )}

                    {hasDuesCard === true && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter your dues card code</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔑</span>
                                <input type="text" value={duesCardCode} onChange={(e) => setDuesCardCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. AB7X3"
                                    maxLength={5}
                                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 text-center text-xl font-bold tracking-widest transition-all uppercase" />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Enter the 5-character code from your physical dues card</p>
                        </div>
                    )}

                    {isMember !== null && (
                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 transition-all text-lg flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating account...
                                </>
                            ) : (
                                '🌟 Create Account'
                            )}
                        </button>
                    )}

                    <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-500 hover:text-purple-600 transition-colors">
                        ← Back to personal details
                    </button>
                </form>
            </div>
        </div>
    );
}
