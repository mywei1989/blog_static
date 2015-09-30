
var gulp = require('gulp');

var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var open = require('gulp-open');
var watch = require('gulp-watch');

var fs = require('fs');
var header  = require('gulp-header');
var asciiart = require('ascii-art');

var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

var inject = require('gulp-inject');




var getCopyright = function(){
  return fs.readFileSync('./assets/global/plugins/null_copyright.js');
};


gulp.task('server', function(done) {
  connect.server({
    port:5001,
    livereload:true
  });
});

gulp.task('asciiart',function(){
  asciiart.Figlet.fontPath = 'Fonts';
  asciiart.font('iloveamy', 'Doom', function(rendered){
      console.log(rendered);
  });
});











/***************/
function GetMinJSName(){
  var jsObj = JSON.parse(fs.readFileSync('./build/rev/rev-js.json'));
  var jsMinName = '';
  for(var i in jsObj){
    jsMinName = jsObj[i];
  }
  return jsMinName;
}
function GetMinCSSName(){
  var cssObj = JSON.parse(fs.readFileSync('./build/rev/rev-css.json'));
  var cssMinName = '';
  for(var i in cssObj){
    cssMinName = cssObj[i];
  }
  return cssMinName;
}
function blog_html_sources(){
  return ['./index.html',
          './detail.html',
          './login.html',
          './post.html'];
}
function blog_css_sources(){
  return ['./assets/global/plugins/normalize.css/normalize.css',
          './assets/blog/css/style.css'];
}

function blog_js_sources(){
  return [];
}
function blog_sources(){
  var html = blog_html_sources();
  var css = blog_css_sources();
  //var js = blog_js_sources();
  var sources = html.concat(html).concat(css);
  return sources;
}

gulp.task('blog_reload',function(){
  return gulp.src(blog_sources())
         .pipe(connect.reload());
});

gulp.task('blog_watch',function(){
  gulp.watch(blog_sources(),['blog_reload']);
});

gulp.task('blog_open',function(){
  return gulp.src(blog_html_sources()[0])
         .pipe(open({uri:'http://localhost:5001/'+blog_html_sources()[0]}));
});


gulp.task('clean_css',function(){
  return gulp.src('./build/**/*.css')
         .pipe(clean({force:true}));
});

gulp.task('min_css',['clean_css'],function(){
  return gulp.src(blog_css_sources())
         .pipe(concat('style.css'))
         .pipe(rename({suffix:'.min'}))
         .pipe(minifycss())
         .pipe(header(getCopyright()))
         .pipe(rev())
         .pipe(gulp.dest('./build/assets/blog/css'))
         .pipe(rev.manifest('rev-css.json'))
         .pipe(gulp.dest('./build/rev'));
});

gulp.task('clean_js',function(){
  return gulp.src('./build/**/*.js')
         .pipe(clean({force:true}));
});
gulp.task('min_js',['clean_js'],function(){
  return gulp.src(blog_js_sources())
         .pipe(concat('blog.js'))
         .pipe(rename({suffix:'.min'}))
         .pipe(uglify())
         .pipe(header(getCopyright()))
         .pipe(rev())
         .pipe(gulp.dest('./build/assets/blog/js'))
         .pipe(rev.manifest('rev-js.json'))
         .pipe(gulp.dest('./build/rev'));
});

gulp.task('clean_images',function(){
  return gulp.src('./build/assets/blog/images/*.*')
         .pipe(clean({force:true}));
});

gulp.task('dest_images',['clean_images'],function(){
  return gulp.src('./assets/blog/images/**/*.*')
         .pipe(gulp.dest('./build/assets/blog/images'));
});

gulp.task('inject',['min_css','min_js','dest_images'],function(){
  gulp.src('./favicon.ico')
      .pipe(gulp.dest('./build'));

  var cssMinName = './build/assets/blog/css/'+GetMinCSSName();
  var jsMinName = './build/assets/blog/js/'+GetMinJSName();
  var target = gulp.src(blog_html_sources());
  var sources = gulp.src([jsMinName,cssMinName]);
  return target.pipe(inject(sources,{relative: true,ignorePath:'build'}))
         .pipe(gulp.dest('./build'));
});

gulp.task('default',['server','blog_watch','blog_open']);
gulp.task('release',['inject']);








