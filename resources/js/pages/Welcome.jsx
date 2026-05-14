import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sliderService } from '../services/api';

export default function Welcome() {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        sliderService.getActive().then((res) => {
            if (res.data.length > 0) setSlides(res.data);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const goTo = (i) => setCurrent(i);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
            {/* Hero Slider */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>

                <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-6">
                    <div className="text-2xl font-bold text-white tracking-tight">
                        <span className="text-pink-400">Youth</span>Faith
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-2 text-white font-medium hover:text-pink-300 transition-colors">Login</Link>
                        <Link to="/register" className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-all hover:scale-105 shadow-lg shadow-pink-500/30">Join Now</Link>
                    </div>
                </nav>

                {slides.length > 0 ? (
                    <div className="relative">
                        {slides.map((slide, i) => (
                            <div key={slide.id} className={`transition-all duration-700 ${i === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}>
                                <div className="relative h-[500px] md:h-[600px]">
                                    <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-purple-900/60 to-transparent" />
                                    <div className="relative z-10 h-full flex items-center">
                                        <div className="container mx-auto px-4 sm:px-8 text-center">
                                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{slide.title}</h1>
                                            {slide.subtitle && <p className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto mb-8">{slide.subtitle}</p>}
                                            {slide.link_url ? (
                                                <a href={slide.link_url} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-xl shadow-purple-500/30">
                                                    Learn More
                                                </a>
                                            ) : (
                                                <Link to="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-xl shadow-purple-500/30">
                                                    Get Started Free
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                            {slides.map((_, i) => (
                                <button key={i} onClick={() => goTo(i)} className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 container mx-auto px-4 sm:px-8 py-20 text-center">
                        <div className="inline-block px-4 py-2 bg-white/10 rounded-full text-pink-300 text-sm font-medium mb-6 backdrop-blur-sm">
                            ✨ Where Young Believers Connect
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Grow Your Faith
                            <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Together</span>
                        </h1>
                        <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-10">
                            Connect with young believers, share your journey, join events, and grow in faith together as one community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-xl shadow-purple-500/30">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                                Explore Community
                            </Link>
                        </div>
                    </div>
                )}

                <div className="absolute top-40 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-60 right-40 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Features Section */}
            <div className="bg-white/5 backdrop-blur-sm py-20">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Grow</h2>
                        <p className="text-purple-300 text-lg">A complete platform for youth ministry</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: '📅', title: 'Events', desc: 'Discover and join youth events, conferences, and fellowship gatherings' },
                            { icon: '📖', title: 'Devotionals', desc: 'Daily spiritual guidance and Bible study materials for your journey' },
                            { icon: '💬', title: 'Community', desc: 'Connect with peers, share experiences, and support each other' },
                            { icon: '🎵', title: 'Worship Music', desc: 'Access curated worship playlists for your personal devotion time' },
                            { icon: '🙏', title: 'Prayer Wall', desc: 'Share prayer requests and pray for others in the community' },
                            { icon: '🏆', title: 'Quizzes & Games', desc: 'Learn about faith through fun interactive quizzes and competitions' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-all hover:-translate-y-2 cursor-pointer group">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-purple-300">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: '500+', label: 'Active Members' },
                            { number: '50+', label: 'Events This Year' },
                            { number: '100+', label: 'Prayer Requests' },
                            { number: '24/7', label: 'Community Support' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                                <div className="text-purple-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 text-center">
                <div className="container mx-auto px-4 sm:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join the Movement?</h2>
                    <p className="text-purple-200 text-xl mb-8 max-w-2xl mx-auto">Join hundreds of young believers who are growing their faith together</p>
                    <Link to="/register" className="inline-block px-10 py-5 bg-white text-purple-900 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">
                        Create Free Account
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10">
                <div className="container mx-auto px-4 sm:px-8 text-center text-purple-400">
                    <p>© 2026 YouthFaith. Built with love for the youth community.</p>
                </div>
            </footer>
        </div>
    );
}
