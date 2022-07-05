const Blogs = require("../RouteModule/BlogsModule")
const APIFeatures = require("../Utils/appFeatures");
const ErrorHandler = require("../Utils/errorHander");
const catchasynchandler = require("../middleware/CatchasyncError")
exports.getAllBlogs = catchasynchandler( async(req, res)=>{

  console.log("Request for total products")
  const features = new APIFeatures(Blogs.find(), req.query).filter().sort().limitFields().pagination();
  const blogs = await features.query;
  res.status(200).json({
      status: 'success',
      results: blogs.length,
      data: {
      products
      }
  })
})

exports.getBlogs = catchasynchandler( async (req, res) => {
  console.log("get products details")
const blogs = await Blogs.findById(req.params.id);
console.log("what the hell")
res.status(200).json({
  status: 'success',
  data: {
    blogs
  }
});
}
);

exports.createBlogs =catchasynchandler( async (req, res) => {

  console.log(req.body);
const newblogs = await Blogs.create(req.body);
console.log(newblogs)
res.status(201).json({
  status: 'success',
  data:{
    product: newblogs
  }
})
});

exports.updateBlogs = catchasynchandler( async(req, res) => {

  const blogs = await Blogs.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true
  })
    res.status(200).json({
      status: 'success',
      data: {
        blogs
      }
    });
  });

exports.deleteBlogs = catchasynchandler(async(req, res) => {
  await Blogs.findByIdAndDelete(req.params.id);
 res.status(200).json({
   status: "success",
   message:"tour deleted"
 })
 
 
 });