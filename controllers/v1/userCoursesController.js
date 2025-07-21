/**
 * name : CriteriaQuestionsController.js
 * author : Akash
 * created-date : 22-Nov-2018
 * Description : Criteria Questions.
 */

/**
 * CriteriaQuestions
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
  