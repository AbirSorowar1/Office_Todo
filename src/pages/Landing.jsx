import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Users,
    Calendar,
    FileText,
    Clock,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Shield,
    Zap,
    Globe
} from 'lucide-react';
import Button from '../components/shared/Button';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Briefcase,
            title: 'Task Management',
            description: 'Organize and track your daily tasks efficiently with priority levels and deadlines.'
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Work together seamlessly with your team using kanban boards and real-time updates.'
        },
        {
            icon: Calendar,
            title: 'Meeting Scheduler',
            description: 'Schedule and manage meetings effortlessly with automated reminders.'
        },
        {
            icon: FileText,
            title: 'Leave Management',
            description: 'Apply for leaves, track balance, and manage approvals all in one place.'
        },
        {
            icon: Clock,
            title: 'Time Tracking',
            description: 'Log your work hours and get detailed reports of your productivity.'
        },
        {
            icon: TrendingUp,
            title: 'Analytics Dashboard',
            description: 'Visualize your performance with comprehensive charts and statistics.'
        }
    ];

    const benefits = [
        'Increase team productivity by 40%',
        'Reduce email clutter and meetings',
        'Real-time collaboration',
        'Secure and reliable platform',
        'Mobile-friendly interface',
        'Automated workflows'
    ];

    const stats = [
        { number: '10K+', label: 'Active Users' },
        { number: '50K+', label: 'Tasks Completed' },
        { number: '99.9%', label: 'Uptime' },
        { number: '24/7', label: 'Support' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Briefcase className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                WorkHub <span className="text-blue-600">Pro</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/signup')}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Zap size={16} />
                            <span>The Future of Workplace Management</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Manage Your Office
                            <span className="text-blue-600"> Smarter & Faster</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            All-in-one platform for task management, team collaboration,
                            leave tracking, and productivity analytics. Transform the way your team works.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={() => navigate('/signup')}
                                icon={ArrowRight}
                            >
                                Start Free Trial
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            >
                                Learn More
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Illustration */}
                    <div className="mt-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                    <Briefcase size={48} className="text-blue-600" />
                                </div>
                                <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                    <Users size={48} className="text-purple-600" />
                                </div>
                                <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={48} className="text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed to streamline your workflow and boost productivity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                        <Icon className="text-blue-600" size={28} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">
                                Why Choose WorkHub Pro?
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Join thousands of teams who trust WorkHub Pro to manage their daily operations efficiently.
                            </p>

                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                                        <span className="text-lg">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    onClick={() => navigate('/signup')}
                                >
                                    Start Your Free Trial
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                                <Shield size={40} className="text-blue-200 mb-4" />
                                <h4 className="font-semibold text-lg mb-2">Secure & Private</h4>
                                <p className="text-blue-100 text-sm">
                                    Enterprise-grade security to protect your data
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                                <Zap size={40} className="text-yellow-300 mb-4" />
                                <h4 className="font-semibold text-lg mb-2">Lightning Fast</h4>
                                <p className="text-blue-100 text-sm">
                                    Real-time updates and instant synchronization
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                                <Globe size={40} className="text-green-300 mb-4" />
                                <h4 className="font-semibold text-lg mb-2">Work Anywhere</h4>
                                <p className="text-blue-100 text-sm">
                                    Access from any device, anytime, anywhere
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                                <Users size={40} className="text-purple-300 mb-4" />
                                <h4 className="font-semibold text-lg mb-2">Team Focused</h4>
                                <p className="text-blue-100 text-sm">
                                    Built for collaboration and teamwork
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to Transform Your Workplace?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join thousands of teams already using WorkHub Pro to boost their productivity
                    </p>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => navigate('/signup')}
                        icon={ArrowRight}
                    >
                        Get Started For Free
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Briefcase size={20} />
                                </div>
                                <span className="text-xl font-bold">WorkHub Pro</span>
                            </div>
                            <p className="text-gray-400">
                                Modern office management platform for the digital age.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Features</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">Security</a></li>
                                <li><a href="#" className="hover:text-white">Enterprise</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} WorkHub Pro. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
