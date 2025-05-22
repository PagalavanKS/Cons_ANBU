import React from 'react';
import { FileText, Printer, BarChart2, Package, TrendingUp, Truck, LineChart, Award, Users, Globe, Shield } from 'lucide-react';
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <div className="home-container">
      <Sidebar />

      <div className="home-content">
        {/* Hero Section */}
        <div className="home-hero" style={{backgroundImage: "url('https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80')"}}>
          <div className="home-hero-overlay"></div>
          <div className="home-hero-content">
            <div className="home-hero-title-container">
              <Award className="home-hero-icon" style={{width: '3rem', height: '3rem', color: '#facc15'}} />
              <h1 className="home-hero-title">
                Anbu Printing Press
              </h1>
            </div>
            <p className="home-hero-subtitle">
              Crafting Your Media Today
            </p>
            <p className="home-hero-address">
              45/7, Salem MainRoad, Kaveripattinam, Krishnagiri- 635112
            </p>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="home-section">
          <h2 className="home-section-title">Our Vision</h2>
          <p className="home-section-content">
            To revolutionize the textile industry through innovation, sustainability, and excellence, 
            while maintaining our commitment to quality and customer satisfaction.
          </p>
        </div>

        {/* Statistics */}
        <div className="home-stats-grid">
          {statistics.map((stat, index) => (
            <div key={index} className="home-stat-card">
              <div className="home-stat-content">
                <div className="home-stat-icon-container">
                  <stat.icon style={{width: '2rem', height: '2rem', color: 'var(--indigo-600)'}} />
                </div>
                <div>
                  <h3 className="home-stat-value">{stat.value}</h3>
                  <p className="home-stat-label">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="home-section">
          <h2 className="home-section-title">Our Core Values</h2>
          <div className="home-cards-grid">
            {coreValues.map((value, index) => (
              <div key={index} className="home-card">
                <value.icon style={{width: '3rem', height: '3rem', color: 'var(--indigo-600)', marginBottom: '1rem'}} />
                <h3 className="home-card-title">{value.title}</h3>
                <p className="home-card-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="home-cards-grid">
          {features.map((feature, index) => (
            <div key={index} className="home-card">
              <feature.icon style={{width: '4rem', height: '4rem', color: 'var(--indigo-600)', marginBottom: '1.5rem'}} />
              <h3 className="home-card-title">
                {feature.title}
              </h3>
              <p className="home-card-description">
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