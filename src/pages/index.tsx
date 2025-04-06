import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTrendingIssues, fetchTackledIssues } from '../store/slices/issuesSlice';
import { getTrendingUsers } from '../services/api';
import Layout from '../components/layout/Layout';
import IssueCard from '../components/issues/IssueCard';
import Button from '../components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { trendingIssues, tackledIssues, isLoading } = useSelector((state: RootState) => state.issues);
  
  useEffect(() => {
    dispatch(fetchTrendingIssues());
    dispatch(fetchTackledIssues());
  }, [dispatch]);

  return (
    <Layout title="Hal Qilamiz - Citizen Issue Reporting Platform">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-uz-blue to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Hal Qilamiz
              </h1>
              <p className="mt-6 text-xl max-w-3xl">
                A platform for citizens of Uzbekistan to report and track community issues until they are resolved.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-white text-uz-blue hover:bg-gray-100"
                >
                  Report an Issue
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:bg-opacity-10"
                >
                  Browse Issues
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img
                src="/images/homepage-illustration.svg"
                alt="Citizen reporting illustration"
                className="max-h-80 w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Our platform empowers citizens to drive positive change in their communities
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 rounded-full bg-uz-blue text-white flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Report Issues</h3>
                <p className="mt-2 text-gray-500">
                  Report any community issues with details, location, and media. Your voice matters!
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 rounded-full bg-uz-blue text-white flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Community Support</h3>
                <p className="mt-2 text-gray-500">
                  Vote on issues to show importance and increase visibility to officials.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 rounded-full bg-uz-blue text-white flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Track Resolution</h3>
                <p className="mt-2 text-gray-500">
                  Follow progress updates until the issue is completely resolved. Stay informed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Issues */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Trending Issues</h2>
            <Link href="/issues" className="text-uz-blue hover:text-uz-blue-dark">
              View all issues
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingIssues.slice(0, 3).map((issue) => (
                <IssueCard key={issue.id} issue={issue} isCompact={true} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" as={Link} href="/issues">
              View More Issues
            </Button>
          </div>
        </div>
      </section>

      {/* Recently Tackled */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recently Tackled</h2>
            <Link href="/issues?status=Resolved" className="text-uz-blue hover:text-uz-blue-dark">
              View all tackled issues
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uz-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tackledIssues.slice(0, 3).map((issue) => (
                <IssueCard key={issue.id} issue={issue} isCompact={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-uz-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Impact</h2>
            <p className="mt-4 text-lg text-blue-100">Together, we're making Uzbekistan better</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold">3,245</div>
              <div className="mt-2 text-blue-100">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">1,879</div>
              <div className="mt-2 text-blue-100">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">58%</div>
              <div className="mt-2 text-blue-100">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">14,587</div>
              <div className="mt-2 text-blue-100">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join Our Community</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Together we can create positive change in our communities. Register today to start reporting issues, voting, and tracking progress.
          </p>
          <div className="mt-8">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => {
                // Open registration modal
              }}
            >
              Create an Account
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}