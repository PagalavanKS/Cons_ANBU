import React from 'react';
import { FileText, Printer, BarChart2, Package, TrendingUp, Truck, LineChart, Award, Users, Globe, Shield } from 'lucide-react';
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Sidebar />

      <div className="flex-1 overflow-auto p-8">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] flex flex-col justify-center items-center text-center bg-[url('https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80')] bg-cover bg-center rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-indigo-900/70 backdrop-blur-[2px]" />
          <div className="relative z-10 px-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Award className="w-12 h-12 text-yellow-400" />
              <h1 className="text-6xl font-extrabold text-white tracking-wide">
                Anbu Printing Press
              </h1>
            </div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto font-light mb-4">
              Crafting Your Media Today
            </p>
            <p className="text-white/80 text-lg italic">
              45/7, Salem MainRoad, Kaveripattinam, Krishnagiri- 635112
            </p>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="mt-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To revolutionize the textile industry through innovation, sustainability, and excellence, 
            while maintaining our commitment to quality and customer satisfaction.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {statistics.map((stat, index) => (
            <div key={index} 
              className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <value.icon className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-lg"
            >
              <feature.icon className="w-16 h-16 mb-6 text-indigo-600" />
              <h3 className="text-2xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const statistics = [
  { icon: Package, value: "100K+", label: "Products Manufactured" },
  { icon: TrendingUp, value: "98%", label: "Customer Satisfaction" },
  { icon: Truck, value: "2500+", label: "Monthly Deliveries" },
  { icon: LineChart, value: "₹150Cr", label: "Annual Revenue" }
];

const coreValues = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "We maintain the highest standards in our manufacturing process, ensuring premium quality in every product."
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Our customers' success is our success. We prioritize their needs and provide exceptional service."
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "Committed to eco-friendly practices and sustainable manufacturing processes."
  }
];

const features = [
  {
    icon: FileText,
    title: "Smart Invoicing",
    description: "Automated invoice generation with customizable templates and instant digital delivery."
  },
  {
    icon: Printer,
    title: "Advanced Analytics",
    description: "Real-time production monitoring and comprehensive performance analytics dashboard."
  },
  {
    icon: BarChart2,
    title: "Market Intelligence",
    description: "Stay ahead with AI-powered market insights and trend predictions."
  }
];

export default Home;