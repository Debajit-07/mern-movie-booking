import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/Movie.css";

const Movie = () => {
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState('');
  const [image, setImage] = useState(null);
  const [movieGenre, setMovieGenre] = useState('');
  const [movieLanguage, setMovieLanguage] = useState('');
  const [movieDuration, setMovieDuration] = useState('');
  // Replace single cast inputs with an array of cast members.
  const [castMembers, setCastMembers] = useState([{ name: "", image: null }]);
  const [movieDescription, setMovieDescription] = useState('');
  const [movieReleasedate, setMovieReleasedate] = useState('');
  const [trailerLink, settrailerlink] = useState('');
  // New state for movie format.
  const [movieFormat, setMovieFormat] = useState('');

  // Handler for movie poster file
  function handleChange(e) {
    console.log(e.target.files);
    setImage(e.target.files[0]);
  }

  // Handlers for cast members
  const handleCastMemberNameChange = (index, value) => {
    const newCastMembers = [...castMembers];
    newCastMembers[index].name = value;
    setCastMembers(newCastMembers);
  };

  const handleCastMemberImageChange = (index, file) => {
    const newCastMembers = [...castMembers];
    newCastMembers[index].image = file;
    setCastMembers(newCastMembers);
  };

  const addCastMember = () => {
    setCastMembers([...castMembers, { name: "", image: null }]);
  };

  const handelSubmit = async (evet) => {
    evet.preventDefault();

    // Prepare cast data as an array of objects.
    // The image property is left as a placeholder; the actual files will be sent separately.
    const castData = castMembers.map(member => ({
      name: member.name,
      image: "" // Placeholder; backend will update based on file upload
    }));

    const formData = new FormData();
    formData.append('movieName', movieName);
    formData.append('image', image);
    formData.append('movieGenre', movieGenre);
    formData.append('movieLanguage', movieLanguage);
    formData.append('movieDuration', movieDuration);
    // Append the cast data as a JSON string.
    formData.append('movieCast', JSON.stringify(castData));
    // Append each cast member's image file if provided.
    castMembers.forEach(member => {
      if (member.image) {
        formData.append('castImage', member.image);
      }
    });
    formData.append('movieDescription', movieDescription);
    formData.append('movieReleasedate', movieReleasedate);
    formData.append('trailerLink', trailerLink);
    // Append the new movie format field.
    formData.append('movieFormat', movieFormat);

    // Debug: log all formData entries
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post('http://localhost:5000/movieschema/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response);
      // Clear form fields
      setMovieName("");
      setMovieGenre("");
      setMovieLanguage("");
      setMovieDuration("");
      setCastMembers([{ name: "", image: null }]);
      setMovieDescription("");
      setMovieReleasedate("");
      settrailerlink("");
      setMovieFormat("");
      navigate("/movieview");
    } catch (err) {
      console.log("error", err);
      if (err.response && err.response.data) {
        console.log("Data", err.response.data.message);
        console.log("Status", err.response.status);
      } else {
        console.log("Error message:", err.message);
      }
    }
  };

  return (
    <body className="Movie_body">
      <form className="form_class_movie" style={{ margin: "5rem" }} onSubmit={handelSubmit}>
        <div className="mb-4">
          <label className="Label_movie">Enter Movie Name</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput"
            placeholder="Enter Movie Name"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Add Movie Poster</label>
          <input type="file" onChange={handleChange} />
          {image && <img src={URL.createObjectURL(image)} alt="Movie Poster" width="100" />}
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Movie Genre</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Movie Genre"
            value={movieGenre}
            onChange={(e) => setMovieGenre(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Language</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Language"
            value={movieLanguage}
            onChange={(e) => setMovieLanguage(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Duration</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Duration"
            value={movieDuration}
            onChange={(e) => setMovieDuration(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Cast Members</label>
          {castMembers.map((member, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Enter Cast Name"
                value={member.name}
                onChange={(e) => handleCastMemberNameChange(index, e.target.value)}
                required
              />
              <input
                type="file"
                onChange={(e) => handleCastMemberImageChange(index, e.target.files[0])}
              />
              {member.image && <img src={URL.createObjectURL(member.image)} alt="Cast" width="100" />}
            </div>
          ))}
          <button type="button" onClick={addCastMember}>Add Cast Member</button>
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Description</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Description"
            value={movieDescription}
            onChange={(e) => setMovieDescription(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Releasedate</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Releasedate"
            value={movieReleasedate}
            onChange={(e) => setMovieReleasedate(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Trailer Link</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Trailer Link"
            value={trailerLink}
            onChange={(e) => settrailerlink(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="mb-4">
          <label className="Label_movie">Enter Movie Format</label>
          <input
            type="text"
            className="form-control_movie"
            id="formGroupExampleInput2"
            placeholder="Enter Movie Format"
            value={movieFormat}
            onChange={(e) => setMovieFormat(e.target.value)}
            required
          />
          <br />
        </div>

        <div className="Submit">
          <button className="Movie_Button" type="submit">Submit</button>
        </div>
      </form>
    </body>
  );
};

export default Movie;
