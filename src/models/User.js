import mongoose from 'mongoose';


const userSchema=mongoose.Schema({
   
    tgId:{
       type:String,
       required:true,
       unique:true,
    },

    firstname:{
        type:String,
        required:true,
        
    },
    lastname:{
        type:String,
        required:true,
        
    },

    isBot:{
     type:String,
     required:true,
    },

    username:{
         type:String,
         required:true,
         unique:true,
    },

    promptTokens:{
        type:Number,
    },

    completedTokens:{
        Type:Number,
    },

},{ timestamps:true});

export default mongoose.model("User",userSchema);