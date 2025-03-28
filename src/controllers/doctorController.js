const Doctor = require("../models/Doctor");

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor }); 
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const searchDoctors = async(req,res) => {
  // console.log("hello");
  try{
    const {query} = req.query;
    // console.log("Search Quer",query);
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query parameter must be a valid string" });
    }
    const doctors = await Doctor.searchDoctors(query);
    res.status(200).json(doctors); 
  }catch(error){  
    console.error("Error in searchDoctors:", error);
    res.status(500).json({message: "Server error", error: error.message});
  }
};


const filterDoctors = async (req, res) => {
  try {
    const { rating, experience, gender } = req.body;

    const filters = {
      rating: rating || -1,
      experience: experience || -1,
      gender: gender || -1
    };
    console.log('Processed filters:', filters);
    const doctors = await Doctor.filterDoctors(filters);
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error in filterDoctors:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoctor = await Doctor.deleteDoctor(id);
    
    if (!deletedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Doctor deleted successfully",
      data: deletedDoctor 
    });
  } catch (error) {
    console.error("Error in deleteDoctor:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, searchDoctors, filterDoctors, deleteDoctor };
