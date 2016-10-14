'use strict';

exports = module.exports = function(app, mongoose) {
  /*
   New in 4.2.0

   You can also embed schemas without using arrays.
  */
  var navSchema = new mongoose.Schema({
       sec1 : {type : String , default : ''},
       secId1 : {type : String ,default : ''},
       sec2 : {type : String ,default : ''},
       secId2 : {type : String ,default : ''},
       sec3 : {type : String , default : ''},
       secId3 : {type : String ,default : ''},
       sec4 : {type : String ,default : ''},
       secId4 : {type : String ,default : ''},
       sec5 : {type : String , default : ''},
       secId5 : {type : String ,default : ''},
       sec6 : {type : String ,default : ''},
       secId6 : {type : String ,default : ''},
       sec7 : {type : String , default : ''},
       secId7 : {type : String ,default : ''},
       sec8 : {type : String ,default : ''},
       secId8 : {type : String ,default : ''},
       sec9 : {type : String , default : ''},
       secId9 : {type : String ,default : ''},
       sec10 : {type : String ,default : ''},
       secId10 : {type : String ,default : ''},
       sec11 : {type : String , default : ''},
       secId11 : {type : String ,default : ''}
  }); 

  var categorySchema = new mongoose.Schema({
    name: { type: String, default: ''},
    uniqueIdentifier : {type :  String , default : ''},
    isParent : {type : Boolean , default : false},
    level : {type: Number ,default : 1},
    nav : navSchema ,
    categoryLevel : [{type :  String}],
    parentName : {type : String ,default : ''},
    description : {type : String ,default : ''},
    attributesSet : [{ type: mongoose.Schema.Types.ObjectId, ref: 'AttributeSet' }],
    tagsNseo : {type : String ,default : ''},
    createdDate : {type: Date,default : Date.now},
    isPublished : {type : Boolean , default : false},
    publishedDate: { type: Date, default: Date.now },
    updatedDate : {type : Date},
    updatedBy : {type : String},
    createdBy : {type: String},
    search: [String]
  });
  categorySchema.plugin(require('./plugins/pagedFind'));
  var deepPopulate = require('mongoose-deep-populate')(mongoose);
  // categorySchema.plugin(deepPopulate,{
  //   whitelist: ['attributesSet.attributes']
  // });
  categorySchema.plugin(deepPopulate,{
    populate: {
      'attributesSet': {
        select: 'name attributes'
      },
      'attributesSet.attributes': {
        select: 'name description'
      }
    }
  });
  categorySchema.index({ name: 1 });
  categorySchema.index({ level: 1 });
  categorySchema.index({ level: 1 ,parentName : 1 ,nav : 1 });
  categorySchema.index({ name : 1 , level: 1 ,parentName : 1 ,nav : 1 });
  /*
    ascending index 
    If an ascending or a descending index is on a single field, the sort operation 
    on the field can be in either direction
  */
  categorySchema.index({ isParent: 1 });
  categorySchema.index({ categoryLevel : 1 });
  categorySchema.index({ attributesSet : 1 });

  /* The ordering and direction of fields in a compound index decide if it’s possible to use 
   the index in the query as well as for the sort*/
  categorySchema.index({ search: 1 });
  categorySchema.index({ parentName : 1 });
  categorySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Category', categorySchema);

/*Indexes are special data structures, that store a small portion of the data set in 
  an easy to traverse form. The index stores the value of a specific field or set of 
  fields, ordered by the value of the field as specified in index.
*/


/*  Sort on Multiple Fields

  Create a compound index to support sorting on multiple fields.

  You can specify a sort on all the keys of the index or on a subset; however, 
  the sort keys must be listed in the same order as they appear in the index. 
  For example, an index key pattern { a: 1, b: 1 } can support a sort on { a: 1, b: 1 } but not 
  on { b: 1, a: 1 }.

  The sort must specify the same sort direction (i.e.ascending/descending) for all its keys as 
  the index key pattern or specify the reverse sort direction for all its keys as the index key 
  pattern. For example, an index key pattern { a: 1, b: 1 } can support a sort on { a: 1, b: 1 } 
  and { a: -1, b: -1 } but not on { a: -1, b: 1 }.
*/

/*Prefixes

Index prefixes are the beginning subsets of indexed fields. For example, consider the following compound index:

{ "item": 1, "location": 1, "stock": 1 }
The index has the following index prefixes:

{ item: 1 }
{ item: 1, location: 1 }
*/

/*If the document fields are indexed, the query will use make use of indexed values to match the 
regular expression. This makes the search very fast as compared to the regular expression scanning 
the whole collection.
*/


// indexes are present in RAM, fetching data from indexes is much faster as
//  compared to fetching data by scanning documents.



};
