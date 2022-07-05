const CatchasyncError = require("../middleware/CatchasyncError");
const User = require("../RouteModule/userModule");
const ErrorHandler = require("../Utils/errorHander");

const filterobj =(obj, ...allowedfilter)=>{
  const newobj = {};
  Object.keys(obj).forEach(el=>{
    if(allowedfilter.includes(el)){
      newobj[el] = obj[el];
    }
  })
  return newobj; 

}


exports.getAllUsers = CatchasyncError(async(req, res) => {
  const users = await User.find();
  
  // send response
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
      data:{
        users: users
      }
    });
  });

exports.getUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
exports.updateMe = CatchasyncError(async(req,res, next) =>{
    if(req.body.Password || req.body.PasswordConfirm){
      return next(new ErrorHandler("This Route is not for password updates. Please use /updatemypassword",400))
    }
    console.log(req.body)
    const filteredBody = filterobj(req.body, 'name', 'email')
    console.log(filteredBody)
    const updateduser = await User.findByIdAndUpdate(req.user.id,
      req.body, {
        new: true, runValidators: true
      });
      console.log(updateduser)
    res.status(200).json({
      status: "success",
      data:{
        user:updateduser
      }
    })

  })
exports.deleteMe = CatchasyncError(async(req, res, next)=>{
  console.log("deleting My self")
  await User.findByIdAndUpdate(req.user.id, {active:false});
  res.status(204).json({
    status: "success",
    data: null
  })

})
exports.createUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    }); 
  };
exports.updateUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
exports.deleteUser = (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!'
    });
  };
  