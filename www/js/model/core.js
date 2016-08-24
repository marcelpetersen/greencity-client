///<reference path="../../typings/tsd.d.ts" />
///<reference path="base.ts" />
///<reference path="gamification.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 *
 */
var User = (function (_super) {
    __extends(User, _super);
    function User() {
        _super.apply(this, arguments);
    }
    return User;
}(GreenCityObject));
var FBUser = (function (_super) {
    __extends(FBUser, _super);
    function FBUser() {
        _super.apply(this, arguments);
    }
    return FBUser;
}(User));
//Green Domains
var Category = (function () {
    function Category() {
    }
    return Category;
}());
//Feed
var PostImage = (function () {
    function PostImage() {
    }
    return PostImage;
}());
//with different Posts
var Post = (function (_super) {
    __extends(Post, _super);
    function Post() {
        _super.apply(this, arguments);
    }
    return Post;
}(GreenCityObject));
