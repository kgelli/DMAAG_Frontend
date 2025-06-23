// src/pages/AboutPage.js
import React from 'react';
import { 
  Mail, 
  Linkedin, 
  ExternalLink, 
  Globe,
  MapPin,
  Building,
  BookOpen,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Elizabeth J. West",
      role: "Principal Investigator",
      department: "English Department & Academic Director, Center for Studies on Africa & Its Diaspora",
      bio: "Professor West specializes in American, African American and African-Atlantic Literatures with an emphasis on Biohistoriography, Narration, and Digital Humanities.",
      image: "/images/team/elizabeth-west.jpg",
      email: "ewest@gsu.edu",
      linkedin: "elizabeth-west",
      website: "https://gsu.edu/faculty/ewest"
    },
    {
      id: 2,
      name: "Chetan Tiwari",
      role: "Primary Advisor of Implementation",
      department: "Associate Professor, Director, Center for Disaster Informatics and Computational Epidemiology    Computer Science, Geosciences",
      image: "/images/team/Chetan-Tiwari.jpg",
      email: "ctiwari@gsu.edu",
      linkedin: "https://www.linkedin.com/in/chetan-tiwari/",
      website: "https://gsudice.dataconn.net/"
    },
    {
      id: 3,
      name: "Shreya Tadipaneni",
      role: "GRA - Lead Software Developer Engineer",
      department: "Computer Science Department, GSU",
      bio: "Developer of the entire DMMAG application, implementing the database architecture, backend systems, and frontend interfaces to create a comprehensive research platform.",
      image: "/images/team/shreya-tadipaneni.jpg",
      email: "shreyatadipaneni2@gmail.com",
      linkedin: "shreya-tadipaneni",
      website: ""
    },

    {
      id: 4,
      name: "Ras Michael Brown",
      role: "Co-Principal Investigator",
      department: "History Department, Georgia State University",
      bio: "Associate Professor specializing in African diaspora history and culture.",
      image: "/images/team/ras-brown.jpg",
      email: "rmbrown@gsu.edu",
      linkedin: "",
      website: ""
    },
    {
      id: 5,
      name: "Robert D. Carlson",
      role: "Co-Research Investigator",
      department: "History Department, Troy University",
      bio: "Lecturer specializing in historical research methods and archival studies.",
      image: "/images/team/robert-carlson.jpg",
      email: "rcarlson@troy.edu",
      linkedin: "",
      website: ""
    },
    {
      id: 6,
      name: "Timothy R. Buckner",
      role: "Co-Research Investigator",
      department: "History Department, Troy University",
      bio: "Professor of history in the Department of History and Philosophy at Troy University. He studies race and slavery in 18th and 19th century America.",
      image: "/images/team/timothy-buckner.jpg",
      email: "tbuckner48602@troy.edu",
      linkedin: "",
      website: ""
    }
  ];

  const collaboratingInstitutions = [
    {
      name: "Georgia State University",
      department: "Department of English",
      location: "Atlanta, GA",
      role: "Lead Institution",
      website: "https://english.gsu.edu/"
    },
    
    {
      name: "Troy University",
      department: "Department of History",
      location: "Troy, AL",
      role: "Partner Institution",
      website: "https://www.troy.edu/academics/colleges-schools/arts-sciences/departments/history/"
    }
  ];

  const publications = [
    {
      title: "Finding Francis: One Family's Journey from Slavery to Freedom",
      authors: "Elizabeth West",
      year: "2022",
      journal: "University of South Carolina Press",
      link: "https://uscpress.com/Finding-Francis"
    },
    {
      title: "Community and Naming: Lived Narratives of Early African American Women's Spirituality",
      authors: "Elizabeth West",
      year: "2020",
      journal: "Religions 11(8), 426",
      link: "https://doi.org/10.3390/rel11080426"
    },
    {
      title: "Sankofa; or 'Go Back and Fetch It': Merging Genealogy and Africana Studies",
      authors: "Elizabeth West (Co-Ed.)",
      year: "2018",
      journal: "Genealogy 2(4), 46 (Special Issue)",
      link: "https://doi.org/10.3390/genealogy2040046"
    }
  ];
  
  const presentations = [
    {
      title: "Black Migration Before the Great Migration",
      presenter: "Elizabeth West, et al",
      venue: "Mississippi Department of Archives and History, Museum of Mississippi History and Mississippi Civil Rights Museum",
      date: "September 4, 2024",
      link: "https://www.youtube.com/watch?v=jrnyntfZzFE"
    },
    {
      title: "Georgia State Researchers' Mapping Project Connects Enslaved People to Specific Enslavers In Harris County",
      presenter: "Elizabeth West, et al ",
      venue: "Closer Look with Rose Scott",
      date: "February 6, 2025",
      link: "https://www.wabe.org/georgia-state-researchers-mapping-project-connects-enslaved-people-to-specific-enslavers-in-harris-county/"
    }
  ];

  const funding = [
    {
      source: "National Endowment for the Humanities",
      grant: "Digital Humanities Advancement Grant",
      period: "2024-2025"
    },
    
    {
      source: "FamilySearch.org",
      grant: "Access to Digital Archives",
      period: "2024-2025"
    },
    {
      source: "The Amos Distinguished Chair in English Letters",
     
      period: "2022-2025"
    }
  ];
  
  const advisoryBoard = [
    {
      name: "Jeff A. Steely",
      role: "Dean of Libraries",
      institution: "Georgia State University"
    },
    {
      name: "Chetan Tiwari",
      role: "Professor & Director of DICE",
      institution: "Georgia State University"
    },
    {
      name: "Brennan Collins",
      role: "Associate Director, CETLOE",
      institution: "Georgia State University"
    },
    {
      name: "Edvige Jean-François",
      role: "Executive Director, CSAD",
      institution: "Georgia State University"
    }
  ];
  
  const graduateResearchAssistants = [
    {
      name: "Tiffany Parks",
      role: "Transcriptions and Story Map",
      program: "English PhD Student, GSU"
    },
    {
      name: "Shreya Tadipaneni",
      role: "Lead Software Development Engineer",
      program: "Computer Science Masters Student, GSU"
    },
    {
      name: "Prithvi Reddy",
      role: "Research Assistant",
      program: "Computer Science Masters Student, GSU"
    },
    {
      name: "Rohith Reddy Kasarla",
      role: "Original Database Designer & Manager",
      program: "Computer Science GRA (Spring 2024), GSU"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">
            About the DMMAG Project
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Data Mining and Mapping Antebellum Georgia - A collaborative research initiative exploring historical data of enslaved individuals in Georgia
          </p>
          <p className="mt-6 text-lg text-gray-700 max-w-4xl mx-auto">
            The vision of the DMMAG project has been to generate a relational database and map that will expand our understanding of the antebellum south, particularly through the lives of enslaved people across the United States South. Where David Eltis's Slave Voyages brought us to the shores and ports of the Americas, DMMAG takes us inland, turning from the Trans-Atlantic to the history of internal forced migrations of Africans and African Americans across the US South.
          </p>
        </div>

        {/* Project Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              The Data Mining and Mapping Antebellum Georgia (DMMAG) project is a comprehensive digital initiative designed to preserve, analyze, and provide access to historical records about enslaved individuals in Georgia during the Antebellum period.
            </p>
            <p className="text-gray-700 mb-4">
              The goal of DMMAG is to generate a scalable database and map prototype that demonstrates how researchers can use digitized genealogical and institutional archives, including early state maps to both identify and geolocate individual enslaved African Americans and their families before emancipation.
            </p>
            <p className="text-gray-700 mb-4">
              Through a collaboration with research partners at Troy University (Alabama) and collaborators at Georgia State University, we have built a pilot database with more than 5000 named enslaved people and a related land database of over 1000 line entries. This allows researchers to connect identified enslaved people to specific enslavers and locations where they may have lived before emancipation. The data is derived from a sample pool of 120 enslavers in Harris County holding the largest numbers of enslaved people, and the properties in Harris County, GA where they may have lived.
            </p>
            <p className="text-gray-700 mb-4">
              The expediency of the archival work was made possible through an agreement with FamilySearch.org that granted our team access to their digitized collection of estate and land records. Further support from Georgia Archives with our map searches and permission to use the 19th Century Harris County map with land lot grids has been central to our story map visualization.
            </p>
            <p className="text-gray-700 mb-4">
              Through the 2024 award of a Digital Humanities Development Grant from the National Endowment for the Humanities (NEH), the pilot DMMAG database and website was developed and launched in spring 2025. Along with this work, the DMMAG created an ArcGIS story map that gives a multimodal overview of the work and the data. The story map was built by a team of faculty, graduate, and undergraduate researchers in collaboration with the GSU Project Lab.
            </p>
            <p className="text-gray-700 mb-4">
              The dynamic quality of the DMMAG project has been the expanse of cross-institutional and cross-disciplinary collaborations and the GSU student research teams that have shaped the outcomes. This includes students from disciplines such as Computer Sciences, Geosciences, English, History, Film, Communications, and Africana Studies.
            </p>
            <p className="text-gray-700">
              We intend for the DMMAG database and story map to serve as a living historical, genealogical, and anthropological archive for both scholars and the public, who, as future end-users, will be able to contribute to this research. This work will contribute an especially meaningful resource for professional and lay researchers who are working to better understand the layered and complex societies of the antebellum south.
            </p>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Meet Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                member.name ? (
                  <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
                    <div className="h-24 w-24 overflow-hidden mx-auto rounded-full border-2 border-blue-100">
                      <img 
                        src={member.image} 
                        alt={`${member.name}`}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/team/profile-placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-blue-600 font-medium mb-1">{member.role}</p>
                      <p className="text-gray-500 text-sm mb-3">{member.department}</p>
                      <p className="text-gray-700 text-sm mb-4">{member.bio}</p>
                      <div className="flex items-center justify-center space-x-4">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`} 
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title={member.email}
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a 
                            href={`https://www.linkedin.com/in/${member.linkedin}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="LinkedIn Profile"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {member.website && (
                          <a 
                            href={member.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="Personal Website"
                          >
                            <Globe className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              )).filter(Boolean)}
            </div>
          </CardContent>
        </Card>
        
        {/* Advisory Board */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Advisory Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advisoryBoard.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-1">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.institution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Graduate Research Assistants */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Graduate Research Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {graduateResearchAssistants.map((member, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-1">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.program}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Institutions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Collaborating Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collaboratingInstitutions.map((institution, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{institution.name}</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.department}</p>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.location}</p>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                      <p>{institution.role}</p>
                    </div>
                    <div className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                      <a 
                        href={institution.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funding */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Funding & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              The DMMAG project gratefully acknowledges the financial support and resources provided by the following organizations:
            </p>
            <div className="space-y-4">
              {funding.map((source, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{source.source}</h3>
                  <p className="text-gray-700 mb-1">{source.grant}</p>
                  <p className="text-gray-600 text-sm">{source.period}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Publications */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Publications & Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publications.map((publication, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{publication.title}</h3>
                  <p className="text-gray-700 mb-1">{publication.authors}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    {publication.journal} • {publication.year}
                  </p>
                  <a 
                    href={publication.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center text-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    View Publication
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Presentations */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Presentations & Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {presentations.map((presentation, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{presentation.title}</h3>
                  <p className="text-gray-700 mb-1">{presentation.presenter}</p>
                  <p className="text-gray-600 text-sm mb-1">
                    {presentation.venue}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    {presentation.date}
                  </p>
                  {presentation.link !== "#" && (
                    <a 
                      href={presentation.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Recording
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Inquiries</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    <a href="mailto:ewest@gsu.edu" className="hover:text-blue-600 transition-colors">
                      ewest@gsu.edu
                    </a>
                  </p>
                  <p className="flex items-start text-gray-700">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600 mt-1" />
                    <span>
                      Department of English<br />
                      Georgia State University<br />
                      Atlanta, GA 30303
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Support</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    <a href="mailto:shreyatadipaneni2@Gmail.com" className="hover:text-blue-600 transition-colors">
                      shreyatadipaneni2@gmail.com
                    </a>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    <a 
                      href="https://gsu.edu/english" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      gsu.edu/english
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

//export default AboutPage;