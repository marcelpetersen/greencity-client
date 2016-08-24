///<reference path="../../typings/tsd.d.ts" />
///<reference path="base.ts" />
///<reference path="gamification.ts" />



/**
 * 
 */
class User extends GreenCityObject {
    email:string;
    username:string;
    badges:Badge[];
    image:string;
    about:string;
    plz:number;
    city:string; 
    follower:User[];
    following:User[];
    posts:Post[];
}

class FBUser extends User {
    facebookID:number; 
}


//Green Domains
class Category {
    name:string;
    icon:string;
}


//Feed
class PostImage {
    name:string
}

//with different Posts
class Post extends GreenCityObject {
    category:Category;    
    text:string;
    location:GeoJSON.Point;
    images:PostImage[];
    user:User;
}




