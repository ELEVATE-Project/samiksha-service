/**
 * name : userCoursesController.js
 * author : PraveenDass
 * created-date : 22-Jul-2025
 * Description : userCourses 
 */

/**
 * userCourses
 * @class
 */
module.exports = class UserCourses extends Abstract {
    constructor() {
      super(userCoursesSchema);
    }
  
    static get name() {
      return 'userCourses';
    }
  };
  