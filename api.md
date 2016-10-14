https://affiliate-api.flipkart.net/affiliate/api/deltaFeeds/teamgroup/category/reh/fromVersion/1376.json

https://affiliate-api.flipkart.net/affiliate/deltaFeeds/teamgroup/category/reh/fromVersion/1376.json?expiresAt=1459816385946&sig=64be56a45c353d2e0be957239a146a51

https://affiliate-api.flipkart.net/affiliate/feeds/teamgroup/category/reh.json?expiresAt=1459816385946&sig=64be56a45c353d2e0be957239a146a51



http://localhost:3000/api/categories?populate[0][path]=attributesSet&populate[1][path]=attributesSet


http://localhost:8080/api/blueprints?categories=570e7d404ad13f0716a66a01&populate[0][path]=categories&populate[1][path]=attributes.attributeInfo


http://localhost:8080/api/blueprints?categories=570e7d404ad13f0716a66a01&attrs[0][color]=blue&populate[0][path]=attributes.attributeInfo&populate[0][select]=name



filters['attributes']= {$elemMatch : {attributeInfo:"5710821c1e8760c020640da"}}; 



http://localhost:8080/api/blueprints?categories=570e7d404ad13f0716a66a01&attrs[0][color]=green&attrs[0][Frame Material]=metal


<!-- 
  sort by popularity
 -->
http://localhost:8080/api/blueprints?categories=570e7d404ad13f0716a66a01&sort=noOfDownloads|asc


<!-- sort by date -->

http://localhost:8080/api/blueprints?categories=570e7d404ad13f0716a66a01&sort=created_at|asc

<!-- shortlist a product  -->

app.put('/api/blueprints/a/shortlist/:id/:type', blueprints.shortList);





<!-- products
 -->
http://localhost:8080/api/products?categories=570e7d404ad13f0716a66a01&sort=updated_at|asc
