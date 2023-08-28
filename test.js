// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// mongoose.set("strictQuery", false);
// mongoose.connect("mongodb://127.0.0.1:27017/ALVSH");


// //                         SCHEMAS                      //

// const loginSchema = new mongoose.Schema({
//     firstname: String,
//     lastname: String,
//     email: String, 
//     password: String
// });

// const carSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     model: String,
//     year: Number,
//     mileage: Number
// });

// const personSchema = new mongoose.Schema({
//     username: String,
//     age: Number,
//     dateOfBirth: {
//         type: Date,
//         required: true
//     },
//     favCar: carSchema
// });

// //                       Constructor                    //

// const Car = mongoose.model("Car", carSchema);
// const Person = mongoose.model("Person", personSchema);
// const Login = mongoose.model('Login', loginSchema);


// //                           Objects                                 //


// const user = new Login({
// firstname: "Alash",
// lastname: "Boakye",
// email: "nb@gmail.com",
// password: "test1234"
// });

// const person = new Person({
//     username: "ALVSH11",
//     age: 25,
//     dateOfBirth: "1992-01-20"
// });

// const abigail = new Person({
//     username: "Abigail",
//     age: 25,
//     dateOfBirth: "",
//     favCar: {
//         name: "Nissan",
//         model: "Altra",
//         year: 2018,
//         mileage: 10000
//     }
// });


// const admin = new Login({
//     firstname: "Admin",
//     lastname: "reg",
//     email: "ar@gmail.com",
//     password: "test1234"
//     });

//     const superAdmin = new Login({
//         firstname: "Super",
//         lastname: "Admin",
//         email: "sa@gmail.com",
//         password: "test1234"
//         });

// const toyota = new Car({
//     name: "Toyota",
//     model: "Corrola",
//     year: 2022,
//     mileage: 10000
// });

// const nissan = new Car({
//     name: "Nissan",
//     model: "Altima",
//     year: 2022,
//     mileage: 10000
// });

// const mercedes = new Car({
//     name: "Mercedes",
//     model: "C-Class",
//     year: 2022,
//     mileage: 10000
// });

// const landRover = new Car({
//     name: "LandRover",
//     model: "Range Rover",
//     year: 2022,
//     mileage: 1000
// });

// const testadmin = new Person({
//     username: "TestAdmin",
//     age: 19,
//     dateOfBirth: 2002-01-20,
//     favCar: mercedes
// });


// Person.findByIdAndUpdate({_id: "63b237dcf01cff402bee3d3e"}, {favCar: nissan}, function(err){
//     if(err) {
//         console.log(err); 
//     } else {
//         console.log("Updated");
//     }
// });

// //                            Find Data                        // 

// Car.find(function(err, cars) {
//     if(err){
//         console.log(err) 
//     } else {
//         mongoose.connection.close();
//         cars.forEach(function(car){
//             console.log(car.name)
//         });
//     }
// });









