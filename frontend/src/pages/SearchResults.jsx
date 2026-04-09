import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { getAvatarUrl, getInitials, getAvatarColor } from '../utils/avatarUrl';
import { MapPin, Github, Linkedin, Loader2 } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(response.data.results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Search Results for "{query}"
        </h1>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No developers found</p>
            <p className="text-gray-400 mt-2">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((dev) => (
              <Link
                key={dev._id}
                to={`/profile/${dev.username}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {dev.profilePicture ? (
                      <img
                        src={getAvatarUrl(dev.profilePicture)}
                        alt={dev.username}
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{
                        backgroundColor: getAvatarColor(dev.username),
                        display: dev.profilePicture ? 'none' : 'flex'
                      }}
                    >
                      {getInitials(dev.displayName || dev.username)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {dev.displayName || dev.username}
                    </h2>
                    <p className="text-gray-600">@{dev.username}</p>

                    {dev.bio && (
                      <p className="text-gray-700 mt-2 line-clamp-2">
                        {dev.bio}
                      </p>
                    )}

                    {dev.skills && dev.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {dev.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {dev.skills.length > 5 && (
                          <span className="text-gray-500 text-sm self-center">
                            +{dev.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {dev.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {dev.location}
                        </div>
                      )}
                      {dev.github && (
                        <a
                          href={dev.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {dev.linkedin && (
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
