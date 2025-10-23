import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, TrendingUp, Shield, Users, Award, BarChart3, Gift, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">EasyGive</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              Empower Your Team to
              <span className="block text-primary-600 mt-2">Make a Difference</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              EasyGive is the leading employee donation platform that makes corporate giving simple, 
              transparent, and impactful. Transform your workplace culture with seamless charitable giving.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">$5M+</div>
              <div className="mt-2 text-gray-600">Donated Through Platform</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">10,000+</div>
              <div className="mt-2 text-gray-600">Active Employees</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">500+</div>
              <div className="mt-2 text-gray-600">Verified Charities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need for Corporate Giving
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed to maximize your impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Donations</h3>
                <p className="text-gray-600">
                  Simple, one-click donations with automatic payroll deduction. 
                  Support your favorite causes effortlessly.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tax Compliance</h3>
                <p className="text-gray-600">
                  Automatic tax receipt generation and year-end reporting. 
                  Stay compliant and maximize deductions.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Analytics</h3>
                <p className="text-gray-600">
                  Track donations, measure impact, and view comprehensive 
                  reports in beautiful dashboards.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Engagement</h3>
                <p className="text-gray-600">
                  Leaderboards, badges, and social features that drive 
                  participation and build team spirit.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Matching</h3>
                <p className="text-gray-600">
                  Flexible matching programs that amplify employee donations 
                  and demonstrate corporate commitment.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Charities</h3>
                <p className="text-gray-600">
                  Access thousands of pre-vetted 501(c)(3) organizations. 
                  Give with confidence.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How EasyGive Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get started in minutes, not months
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up Your Company</h3>
              <p className="text-gray-600">
                Quick registration process. Add your company details and configure matching policies.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Invite Your Team</h3>
              <p className="text-gray-600">
                Employees create accounts and browse thousands of verified charities to support.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Make an Impact</h3>
              <p className="text-gray-600">
                Track donations, view impact metrics, and watch your team's generosity grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Companies Choose EasyGive
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Boost Employee Engagement</h4>
                    <p className="text-gray-600">Increase retention and satisfaction through meaningful giving programs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Simplify Administration</h4>
                    <p className="text-gray-600">Automate tax documentation, reporting, and compliance tracking.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Strengthen Your Brand</h4>
                    <p className="text-gray-600">Demonstrate corporate social responsibility with measurable impact.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Gain Valuable Insights</h4>
                    <p className="text-gray-600">Understand giving patterns and optimize your matching programs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Enterprise Security</h4>
                    <p className="text-gray-600">Bank-level encryption and security to protect sensitive data.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white">
                <TrendingUp className="h-16 w-16 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Workplace?</h3>
                <p className="text-primary-100 mb-6">
                  Join hundreds of companies using EasyGive to create a culture of giving 
                  and make a real difference in the world.
                </p>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100 border-white">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Making a Difference Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Set up your corporate giving program in minutes and empower your team to support the causes they care about.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100 border-white text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="text-white border-white hover:bg-primary-700 text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">EasyGive</span>
              </div>
              <p className="text-sm">
                Making corporate giving easy, transparent, and impactful.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Features</Link></li>
                <li><Link to="/login" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">About</Link></li>
                <li><Link to="/login" className="hover:text-white">Blog</Link></li>
                <li><Link to="/login" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/login" className="hover:text-white">Contact</Link></li>
                <li><Link to="/login" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 EasyGive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

