//GET/api/user/
 
export const getUserData=async (req,res)=>{
    try{
      const role=req.user.role;
      const recentSearchedCities=req.user.recentSearchedCities;
      res.json({success:true,role,recentSearchedCities})
    }
  catch(error){
    res.json({success:false,message:error.message})
  }
}
//store user recent searched cities
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCities } = req.body;
    const user = await req.user;

    console.log("Received city:", recentSearchedCities);

    if (!recentSearchedCities) {
      return res.json({
        success: false,
        message: "City is required"
      });
    }

    // Remove old null/undefined values
    user.recentSearchedCities =
      user.recentSearchedCities.filter(city => city);

    if (user.recentSearchedCities.length < 3) {
      user.recentSearchedCities.push(recentSearchedCities);
    } else {
      user.recentSearchedCities.shift();
      user.recentSearchedCities.push(recentSearchedCities);
    }

    await user.save();

    res.json({
      success: true,
      message: "City added"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};