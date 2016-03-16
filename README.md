# image-resizer
There is a 4 step process to using this application.

1. Use app.js to **download** the images that are listed in your .csv file to a target Directory (`outputDir`).
  * You will want to change line 7 of app.js to target your .csv file
    (this should really be changed to a cmd line arg)
  * This code is run with  `node app.js `

2. Run resize_script.js, to pull images from your `targetDir` from app.js and resize them.
  * The images will be pulled from this files `targetDir` specified on line 17.
  * They will be placed into a new `resizedDir` specified on line 16 of resizer.js

  (Again, these should probably be another cmd line arg)

3. Use upload.js to upload your newly resized images to S3 and create a .csv file with photo_id, and url.

  (Note the urls have listing_id and photo_id specified in them i.e. ...cloudfront.net/2016-01-27/listing_7886_photo_40058.jpeg)
  * You will want to target the `resizedDir` directory from resizer.js as your new `targetDir` for this file.
  * You will also want to specify the output directory for the .csv what you will generate.

4. Use sql_builder.js to turn the output of upload.js into sql that can be run on the production DB.
    * Specify which file to read from in order to create the sql (line 6 on sql_builder.js).
    * This will console log the result which will be a large SQL statement. Because of this, you may want to run `node sql_builder.js > some_sql_file.sql`
