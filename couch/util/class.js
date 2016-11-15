/**
 * Copyright 2015 Kerem Güneş
 *   <k-gun@mail.com>
 *
 * Apache License, Version 2.0
 *   <http://www.apache.org/licenses/LICENSE-2.0>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Class object.
 * @public
 *
 * @module Couch
 * @object Couch.Class
 * @author Kerem Güneş <k-gun@mail.com>
 */
var Class = (function() { return {
   /**
    * Create a fresh class.
    * @public
    *
    * @param  {String} name
    * @param  {Object} prototype
    * @return {Object}
    */
   create: function(name, prototype){
      // internal
      function Class() {
         // should be function
         if (this.__init__) {
            this.__init__.apply(this, arguments);
         }
      }

      // add prototype
      Class.prototype = prototype;

      // add constructor (with original name)
      Class.prototype.constructor = (function(){
         eval("var Constructor = function "+ name +"(){}");
         Constructor.prototype = prototype;
         Constructor.prototype.constructor = Constructor;
         return Constructor;
      })();

      return Class;
   },

   /**
    * Extend an existing class.
    * @public
    *
    * @param  {Object} target
    * @param  {Object} source
    * @return {Object}
    */
   extend: function(target, source) {
      for (var i in source) {
         // skip private stuff
         if (0 === i.indexOf("_")) {
            continue;
         }

         if (target.prototype) {
            target.prototype[i] = source[i];
         } else {
            target[i] = source[i];
         }
      }

      return target;
   }
}})();

/**
 * Expose module.
 */
module.exports = Class;
