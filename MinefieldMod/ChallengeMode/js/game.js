var game = {
  // game infos
  state: null,
  level: 1,
  level_max: 50,
  best_level: 1,
  warning: 0,
  mines_total: 5,
  mode: null,
  first_digg: false,
  board: [],
  rows: 7,
  cols: 7,
  images: [
    'images/sprite.png',
    'images/buttons.png',
    'images/explosion.png'
  ],

  init: function () {
    if (game.is_touch_device()) {
      $('body').addClass('touch');
    } else {
      $('body').addClass('no-touch');

    }
    // listen player input
    $('#board').on(game.is_touch_device()?'touchmove':'mousemove', function (e) {
      e.preventDefault();
    });
    $('#switch').on(game.is_touch_device()?'touchstart':'mousedown', function (e) {
      e.preventDefault();
      if (game.mode == 'digg') {
        game.set_mode('flag');
      } else {
        game.set_mode('digg');
      };
    });

    var board_element = document.getElementById('board');

    board_element.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });

    $(window).resize(game.resize);
    
    // check saved level
    var local_level_minefield = localStorage.getItem('level_minefieldchallenge');
    if (local_level_minefield != null) {
      game.level = Number(local_level_minefield);
    }
    var local_best_level_minefield = localStorage.getItem('best_level_minefieldchallenge');
    if (local_best_level_minefield != null) {
      game.best_level = Number(local_best_level_minefield);
    }
    var local_warning_minefield = localStorage.getItem('warning_minefieldchallenge');
    if (local_warning_minefield != null) {
      game.warning = Number(local_warning_minefield);
    }

    // lauch game
    // wait until every image is loaded to launch the game
    game.loadimages(game.images, function () {
      game.start();
    });

  },

  start: function () {
    game.mines_total = 9 + game.level;
    game.rows = game.cols = 7;
    $('#board').removeClass('board-8 board-9 board-10');
    if (game.level > 5) {
      game.rows = game.cols = 8;
      $('#board').addClass('board-8');
    }
    if (game.level > 9) {
      game.rows = game.cols = 10;
      $('#board').addClass('board-10');
    }
    if (game.level > 14) {
      game.rows = game.cols = 11;
      $('#board').addClass('board-11');
    }
	if (game.level > 24) {
      game.rows = game.cols = 13;
      $('#board').addClass('board-13');
    }
	if (game.level > 39) {
      game.rows = game.cols = 15;
      $('#board').addClass('board-15');
    }
	if (game.level > 46) {
      game.rows = game.cols = 17;
      $('#board').addClass('board-17');
    }
    $('#level-zone').html('Level ' + game.level + '<br>Best ' + game.best_level);
    $('#nb-flags').html('0');
    $('#nb-mines').html(game.mines_total);

    // create board
    var board_html = '<table>';
    for (var i = 0; i < game.rows; i++) {
      game.board[i] = [];
      board_html += '<tr>';
      for (var j = 0; j < game.cols; j++) {
        game.board[i][j] = {
          played: false,
          mine: false,
          flag: false,
          hint: false,
          around: 0
        };
        board_html += '<td class="tile not-played" id="tile-' + j + '-' + i + '" data-x="' + j + '" data-y="' + i + '">&nbsp;</td>'
      }
      board_html += '</tr>';
    }
    board_html += '</table>';
    $('#board').html(board_html);

    // add mines
    var nb_mines = 0;
    while (nb_mines < game.mines_total) {
      var rand_x = Math.floor(Math.random()*game.cols);
      var rand_y = Math.floor(Math.random()*game.rows);
      if (game.board[rand_y][rand_x].mine == false) {
        game.board[rand_y][rand_x].mine = true;
        nb_mines++;
      }
    }

    // add numbers
    game.add_numbers();

    game.resize();

    game.first_digg = true;
    

    $('.tile').on(game.is_touch_device()?'touchstart':'mousedown', function (e) {
      if (!game.is_touch_device()) {
        switch (e.which) {
          case 1 : 
            game.set_mode('digg');
          break;
          case 3 : 
            game.set_mode('flag');
            e.preventDefault();
          break;
        }
      }
      game.play_tile($(this).data('x'), $(this).data('y'));
    });

    game.set_mode('digg');

    // intro animation
    $('#overlay').fadeOut();

    setTimeout(function () {
      // hide the address bar
      window.scrollTo(0, 1);
    }, 0);

  },

  add_numbers: function () {
    for (var i = 0; i < game.rows; i++) {
      for (var j = 0; j < game.cols; j++) {
        if (game.board[i][j].mine == false){
          var nb_mines = 0;
          // up
          if (i-1 >= 0) {
            if (game.board[i-1][j].mine) {
              nb_mines++;
            }
          }
          // up right
          if (i-1 >= 0 && j+1 < game.cols) {
            if (game.board[i-1][j+1].mine) {
              nb_mines++;
            }
          }
          // right
          if (j+1 < game.cols) {
            if (game.board[i][j+1].mine) {
              nb_mines++;
            }
          }
          // down right
          if (i+1 < game.rows && j+1 < game.cols) {
            if (game.board[i+1][j+1].mine) {
              nb_mines++;
            }
          }
          // down
          if (i+1 < game.rows) {
            if (game.board[i+1][j].mine) {
              nb_mines++;
            }
          }
          // down left
          if (i+1 < game.rows && j-1 >= 0) {
            if (game.board[i+1][j-1].mine) {
              nb_mines++;
            }
          }
          // left
          if (j-1 >= 0) {
            if (game.board[i][j-1].mine) {
              nb_mines++;
            }
          }
          // up left
          if (i-1 >= 0 && j-1 >= 0) {
            if (game.board[i-1][j-1].mine) {
              nb_mines++;
            }
          }  
          game.board[i][j].around = nb_mines;
        }
      }
    }
  },

  set_mode: function (new_mode) {
    game.mode = new_mode;
    $('#switch').removeClass('digg flag').addClass(game.mode);
  },


  play_tile: function (x, y) {
    var $tile = $('#tile-' + x + '-' + y);

    if (game.board[y][x].played) {
      if (game.board[y][x].around != 0) {
        // count flags around
        var nb_flags = 0;
        // up
        if (y-1 >= 0) {
          if (game.board[y-1][x].flag) {
            nb_flags++;
          }
        }
        // up right
        if (y-1 >= 0 && x+1 < game.cols) {
          if (game.board[y-1][x+1].flag) {
            nb_flags++;
          }
        }
        // right
        if (x+1 < game.cols) {
          if (game.board[y][x+1].flag) {
            nb_flags++;
          }
        }
        // down right
        if (y+1 < game.rows && x+1 < game.cols) {
          if (game.board[y+1][x+1].flag) {
            nb_flags++;
          }
        }
        // down
        if (y+1 < game.rows) {
          if (game.board[y+1][x].flag) {
            nb_flags++;
          }
        }
        // down left
        if (y+1 < game.rows && x-1 >= 0) {
          if (game.board[y+1][x-1].flag) {
            nb_flags++;
          }
        }
        // left
        if (x-1 >= 0) {
          if (game.board[y][x-1].flag) {
            nb_flags++;
          }
        }
        // up left
        if (y-1 >= 0 && x-1 >= 0) {
          if (game.board[y-1][x-1].flag) {
            nb_flags++;
          }
        }

        if (nb_flags == game.board[y][x].around) {
          // reveal surrounding tiles
          // up
          if (y-1 >= 0) {
            if (game.board[y-1][x].flag == false && game.board[y-1][x].played == false) {
              game.digg_tile(x, y-1);
            }
          }
          // up right
          if (y-1 >= 0 && x+1 < game.cols) {
            if (game.board[y-1][x+1].flag == false && game.board[y-1][x+1].played == false) {
              game.digg_tile(x+1, y-1);
            }
          }
          // right
          if (x+1 < game.cols) {
            if (game.board[y][x+1].flag == false && game.board[y][x+1].played == false) {
              game.digg_tile(x+1, y);
            }
          }
          // down right
          if (y+1 < game.rows && x+1 < game.cols) {
            if (game.board[y+1][x+1].flag == false && game.board[y+1][x+1].played == false) {
              game.digg_tile(x+1, y+1);
            }
          }
          // down
          if (y+1 < game.rows) {
            if (game.board[y+1][x].flag == false && game.board[y+1][x].played == false) {
              game.digg_tile(x, y+1);
            }
          }
          // down left
          if (y+1 < game.rows && x-1 >= 0) {
            if (game.board[y+1][x-1].flag == false && game.board[y+1][x-1].played == false) {
              game.digg_tile(x-1, y+1);
            }
          }
          // left
          if (x-1 >= 0) {
            if (game.board[y][x-1].flag == false && game.board[y][x-1].played == false) {
              game.digg_tile(x-1, y);
            }
          }
          // up left
          if (y-1 >= 0 && x-1 >= 0) {
            if (game.board[y-1][x-1].flag == false && game.board[y-1][x-1].played == false) {
              game.digg_tile(x-1, y-1);
            }
          }


        }
      }

    } else {
      // not played
      switch (game.mode) {
        case 'digg' :
          game.digg_tile(x, y);
        break;

        case 'flag' :
          if (game.board[y][x].flag) {
            game.board[y][x].flag = false;
            $tile.removeClass('flag');
          } else {
            game.board[y][x].flag = true;
            $tile.addClass('flag');
          }
          var nb_flags = 0;
          for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
              if (game.board[i][j].flag) {
                nb_flags++;
              }
            }
          }
          $('#nb-flags').html(nb_flags);
        break;

        case 'hint' :

        break;
      }
    }

  },

  digg_tile: function (x, y) {
    var $tile = $('#tile-' + x + '-' + y);
    if (game.board[y][x].flag == false) {
      if (game.first_digg) {
        if (game.board[y][x].mine || game.board[y][x].around != 0) {
          // remove mines around
          var new_mines = 0;
          // self
          if (game.board[y][x].mine) {
            game.board[y][x].mine = false;
            new_mines++;
          }
          // up
          if (y-1 >= 0) {
            if (game.board[y-1][x].mine) {
              game.board[y-1][x].mine = false;
              new_mines++;
            }
          }
          // up right
          if (y-1 >= 0 && x+1 < game.cols) {
            if (game.board[y-1][x+1].mine) {
              game.board[y-1][x+1].mine = false;
              new_mines++;
            }
          }
          // right
          if (x+1 < game.cols) {
            if (game.board[y][x+1].mine) {
              game.board[y][x+1].mine = false;
              new_mines++;
            }
          }
          // down right
          if (y+1 < game.rows && x+1 < game.cols) {
            if (game.board[y+1][x+1].mine) {
              game.board[y+1][x+1].mine = false;
              new_mines++;
            }
          }
          // down
          if (y+1 < game.rows) {
            if (game.board[y+1][x].mine) {
              game.board[y+1][x].mine = false;
              new_mines++;
            }
          }
          // down left
          if (y+1 < game.rows && x-1 >= 0) {
            if (game.board[y+1][x-1].mine) {
              game.board[y+1][x-1].mine = false;
              new_mines++;
            }
          }
          // left
          if (x-1 >= 0) {
            if (game.board[y][x-1].mine) {
              game.board[y][x-1].mine = false;
              new_mines++;
            }
          }
          // up left
          if (y-1 >= 0 && x-1 >= 0) {
            if (game.board[y-1][x-1].mine) {
              game.board[y-1][x-1].mine = false;
              new_mines++;
            }
          }
          
          while (new_mines > 0) {
            var rand_x = Math.floor(Math.random()*game.cols);
            var rand_y = Math.floor(Math.random()*game.rows);
            if (game.board[rand_y][rand_x].mine == false
              && (rand_y < y-1 || rand_y > y+1)
              && (rand_x < x-1 || rand_x > x+1)) {
              game.board[rand_y][rand_x].mine = true;
              new_mines--;
            }
          }
          game.add_numbers();
        }
        game.first_digg = false;
      }

      
      if (game.board[y][x].mine) {
        game.board[y][x].played = true;
        $tile.removeClass('not-played');
        $tile.addClass('played');
        $tile.addClass('exploded');
        game.explosion(x, y);
        game.lose();
      } else {
        game.board[y][x].played = true;
        $tile.removeClass('not-played');
        $tile.addClass('played');
        if (game.board[y][x].around == 0) {
          game.discover(x, y);
        } else {
          $tile.addClass('around-' + game.board[y][x].around);
          $tile.html(game.board[y][x].around);
        }
        // check board cleared
        var nb_played = 0;
        for (var i = 0; i < game.rows; i++) {
          for (var j = 0; j < game.cols; j++) {
            if (game.board[i][j].played) {
              nb_played++;
            }
          }
        }
        if (nb_played == (game.rows * game.cols) - game.mines_total) {
          game.win();
        }
      }
      
    }
  },

  discover: function (x, y) {
    // up
    if (y-1 >= 0) {
      game.reveal_tile(x, y-1);
    }
    // up right
    if (y-1 >= 0 && x+1 < game.cols) {
      game.reveal_tile(x+1, y-1);
    }
    // right
    if (x+1 < game.cols) {
      game.reveal_tile(x+1, y);
    }
    // down right
    if (y+1 < game.rows && x+1 < game.cols) {
      game.reveal_tile(x+1, y+1);
    }
    // down
    if (y+1 < game.rows) {
      game.reveal_tile(x, y+1);
    }
    // down left
    if (y+1 < game.rows && x-1 >= 0) {
      game.reveal_tile(x-1, y+1);
    }
    // left
    if (x-1 >= 0) {
      game.reveal_tile(x-1, y);
      
    }
    // up left
    if (y-1 >= 0 && x-1 >= 0) {
      game.reveal_tile(x-1, y-1);
      
    }
  },

  reveal_tile: function (x, y) {
    if (game.board[y][x].played == false && game.board[y][x].flag == false) {
      var $tile = $('#tile-' + x + '-' + y);
      game.board[y][x].played = true;
      $tile.removeClass('not-played');
      $tile.addClass('played');
      if (game.board[y][x].around == 0) {
        game.discover(x, y);
      } else {
        $tile.addClass('around-' + game.board[y][x].around);
        $tile.html(game.board[y][x].around);
      }
    }
  },


  win: function () {
    $('.tile').unbind(game.is_touch_device()?'touchstart':'mousedown');
    var $h3 = null;
    game.level++;
    if (game.level > game.level_max) {
      game.level = game.level_max;
      $h3 = $('<h3>Congratulations!<br>You beat the last level! You have true mine-sweeping skills!</h3>');
    } 
	else if (game.level == 26) {
	$h3 = $('<h3>Amazing work!.<br>You have beaten 25 challenges! Can you do the next 25...</h3>');	
	}
	else {
      $h3 = $('<h3>Level up!</h3>');
    };
    try {
      localStorage.setItem('level_minefieldchallenge', game.level);
      setTimeout(function() {
        $msg_save = $('<h3>(saved)</h3>');
        $('#overlay').append($msg_save);
        $msg_save.hide().fadeIn();
      }, 900);
    } catch (error) {}
    if (game.level > game.best_level) {
      game.best_level = game.level;
      try {
        localStorage.setItem('best_level_minefieldchallenge', game.best_level);
      } catch (error) {}
    }
    game.warning = 0;
    try {
      localStorage.setItem('warning_minefieldchallenge', game.warning);
    } catch (error) {}
    $('#overlay').html('<h2 class="msg-win">You Win</h2>').fadeIn();
    setTimeout(function() {
      $('#overlay').append($h3);
      $h3.hide().fadeIn();
    }, 600);
    setTimeout(function() {
      var $button = $('<span class="bt-play">Play level ' + game.level + ' / ' + game.level_max + '<span>');
      $('#overlay').append($button);
      $button.hide().fadeIn().on('click', game.start);
    }, 1200);

  },

  lose: function () {
    $('.tile').unbind(game.is_touch_device()?'touchstart':'mousedown');
    $('#overlay').html('<h2 class="msg-lose">You Lose</h2>');
    setTimeout(function() {
      $('#overlay').fadeIn();
    }, 600);
    // show mines and wrong flags
    for (var i = 0; i < game.rows; i++) {
      for (var j = 0; j < game.cols; j++) {
        if (game.board[i][j].mine && game.board[i][j].flag == false) {
            $('#tile-' + j + '-' + i).addClass('mine');
        }
        if (game.board[i][j].mine == false && game.board[i][j].flag) {
            $('#tile-' + j + '-' + i).addClass('wrong-flag');
        }
      }
    }
    var $h3 = null;
    game.warning++;
    try {
      localStorage.setItem('warning_minefieldchallenge', game.warning);
    } catch (error) {}
    if (game.warning > 1 && game.level > 1) {
      game.level--;
      try {
        localStorage.setItem('level_minefieldchallenge', game.level);
        setTimeout(function() {
          $msg_save = $('<h3>(saved)</h3>');
          $('#overlay').append($msg_save);
          $msg_save.hide().fadeIn();
        }, 1500);
      } catch (error) {}
      game.warning = 0;
      try {
        localStorage.setItem('warning_minefieldchallenge', game.warning);
      } catch (error) {}
      $h3 = $('<h3>Level down...</h3>');
    } else {
      $h3 = $('<h3>Warning</h3>');
    };
    setTimeout(function() {
      $('#overlay').append($h3);
      $h3.hide().fadeIn();
    }, 1200);
    setTimeout(function() {
      var $button = $('<span class="bt-play">Play level ' + game.level + ' / ' + game.level_max + '<span>');
      $('#overlay').append($button);
      $button.hide().fadeIn().on('click', game.start);
    }, 1800);

  },

  explosion: function(x, y) {
    var $explosion = $('<div class="explosion"></div>');
    $explosion.css({
      'left': (x - 1) * (100 / game.cols) + '%',
      'top': (y - 1) * (100 / game.rows) + '%',
      'width': 3 * (100 / game.cols) + '%',
      'height': 3 * (100 / game.rows) + '%'
    });
    $('#board').append($explosion);
    setTimeout(function () {
      $explosion.remove();
    }, 600);

  },

  is_touch_device: function() {
    try {  
      document.createEvent("TouchEvent");  
      return true;  
    } catch (e) {  
      return false;  
    }
  },

  resize: function() {
    $('#board').css({
      height: $('#board').width()
    });
    $('#infos').css({
      height: $('#board').width() * .18104
    });
    $('.tile').css({
      width: (100 / game.cols) + '%',
      height: (100 / game.rows) + '%'
    });
    $('#overlay').css({
      width: $('#board').width(),
      height: $('#board').height(),
      top: $('#board').offset().top
    });
  },

  loadimages: function(imgArr,callback) {
    //Keep track of the images that are loaded
    var imagesLoaded = 0;
    function _loadAllImages(callback) {
      //Create an temp image and load the url
      var img = new Image();
      $(img).attr('src',imgArr[imagesLoaded]);
      if (img.complete || img.readyState === 4) {
        // image is cached
        imagesLoaded++;
        //Check if all images are loaded
        if (imagesLoaded == imgArr.length) {
          //If all images loaded do the callback
          callback();
        } else {
          //If not all images are loaded call own function again
          _loadAllImages(callback);
        }
      } else {
        $(img).load(function () {
          //Increment the images loaded variable
          imagesLoaded++;
          //Check if all images are loaded
          if (imagesLoaded == imgArr.length) {
            //If all images loaded do the callback
            callback();
          } else {
            //If not all images are loaded call own function again
            _loadAllImages(callback);
          }
        });
      }
    };    
    _loadAllImages(callback);
  }

};

$(function() {
  game.init();
});
