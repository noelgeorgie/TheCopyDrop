import { BarChart2, FileText, Users } from 'lucide-react';

const featureList = [
  { icon: <BarChart2 size={32} className="text-blue-500" />, title: "Data Analytics", description: "Access real-time sales and performance metrics." },
  { icon: <FileText size={32} className="text-blue-500" />, title: "Reporting Tools", description: "Generate and download weekly or monthly reports." },
  { icon: <Users size={32} className="text-blue-500" />, title: "Employee Directory", description: "Quickly find contact information for any team member." }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-800 transition-colors">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 dark:text-white">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureList.map((feature, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg">
              <div className="flex justify-center items-center mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}