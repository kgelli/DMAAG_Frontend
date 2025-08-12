// src/pages/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Database,
  Book,
  Search,
  Map,
  Users,
  History,
  Globe,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Data Mining and Mapping Antebellum Georgia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preserving and exploring historical data about enslaved individuals
            in Georgia through an accessible, comprehensive digital platform.
          </p>
        </div>

        {/* About Section - Added with Project Aims */}
        <Card className="mb-16 hover:shadow-xl transition-shadow border-t-4 border-blue-600">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-8 w-8 text-blue-600" />
              <CardTitle>About the dmaag Project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                <strong>
                  Our aim is to build an experimental database and website
                  platform
                </strong>{" "}
                to explore the viability of a scalable database that would
                include all of Harris County and later all 19th Century Georgia
                counties. This platform serves as a proof of concept for
                larger-scale historical data preservation and accessibility.
              </p>
              <p className="text-gray-600">
                The website is still in the building process, and your feedback
                is greatly appreciated as we continue to develop and refine this
                resource. Our mission is to preserve and present historical data
                in a modern, accessible format, enabling researchers,
                historians, genealogists, and the public to explore and
                understand the lives of enslaved individuals in Georgia during
                the Antebellum period.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Collections - Keeping original 2-column layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <CardHeader>
              <Database className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>GSU Records Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Access Georgia State University's comprehensive collection of
                historical deed records, property transactions, and documents
                that provide insights into the lives of enslaved individuals and
                their communities.
              </p>
              <button
                onClick={() => navigate("/gsu")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore GSU Records
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <CardHeader>
              <Book className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Troy Records Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Discover Troy University's historical records documenting
                enslaved individuals, transactions, and significant historical
                events that shaped Antebellum Georgia's history and society.
              </p>
              <button
                onClick={() => navigate("/troy")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Troy Records
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Updated Advanced Search card to be a proper Link */}
          <Link to="/advanced-search" className="no-underline">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Search className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Advanced Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Powerful search functionality to locate specific records
                  across both GSU and Troy databases.
                </p>
              </CardContent>
            </Card>
          </Link>

          <a
            href="https://storymaps.arcgis.com/stories/62ae4d70bb074afea292b3a96d43a1ca"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:no-underline"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Map className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle className="text-lg">
                  Geographic Story Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interactive Geographic Story Mapping, tools to visualize
                  historical locations and movement patterns.
                </p>
              </CardContent>
            </Card>
          </a>

          {/* Updated Data Visualization card with Link */}
          <Link to="/visualization" className="no-underline">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <History className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle className="text-lg">Data Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Dynamic visualizations to understand historical trends and
                  patterns in the data.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Target Users Section */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Who Can Benefit</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Book className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-3">
                  Researchers & Historians
                </h3>
                <p className="text-gray-600">
                  Access comprehensive historical data, primary source
                  documents, and analytical tools to support academic research
                  and historical analysis.
                </p>
              </div>
              <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Genealogists</h3>
                <p className="text-gray-600">
                  Trace family histories, discover ancestral connections, and
                  reconstruct family narratives through detailed historical
                  records.
                </p>
              </div>
              <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="bg-blue-100 rounded-full p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-3">General Public</h3>
                <p className="text-gray-600">
                  Explore Georgia's rich history, learn about significant
                  historical events, and engage with interactive visualizations
                  of historical data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
