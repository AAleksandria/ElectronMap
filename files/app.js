
      var map;                  // переменная с картой 
      var latlngmap;            // координаты построения карты
      var latlngA;              // координаты начального пути
      var latlngB;              // координаты конечного пути
      var directionsDisplay;    // обеспечивает отображение пути, маркеров
      var directionsService;    // объект взаимодействует c Direction Service API, 
                                // получает запросы маршрутов и возвращает рассчитанные результаты
      var marker;               // хранит маркер точки А
      
      var start_address = document.getElementById('start_address'); // элемент для вывода начального адреса
      var end_address = document.getElementById('end_address');     // элемент для вывода конечного адреса
      var time = document.getElementById('time');                   // элемент для вывода времени движения
      var distance = document.getElementById('distance');           // элемент для вывода расстояния пути

      // инициализация карты, установка addListener для перехвата DOM событий
      function initMap() {
        directionsDisplay = new google.maps.DirectionsRenderer({
          draggable: true
        });                                                     // обеспечивает отображение пути, маркеров
        directionsService = new google.maps.DirectionsService;  // объект взаимодействует c Direction Service API, 
                                                                // получает запросы маршрутов и возвращает рассчитанные результаты
        
        latlngmap = new google.maps.LatLng(37.77,-122.447);
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: latlngmap
        });                                                     // создаём карту для отображения 

        directionsDisplay.setMap(map);                          // вывод карты  
        
        // по изменению combobox рассчитывается новый путь 
        document.getElementById('mode').addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });

        // после перетаскивания пути будет изменён вывод описания
        directionsDisplay.addListener('directions_changed', function() {
          computeTotalDistance(directionsDisplay.getDirections());
        });

        // по нажатию на правую кнопку мыши будет выводено контекстное меню
        google.maps.event.addListener(map, "rightclick", function(event){
          showContextMenu(event.latLng);
        });
        
        // по нажатию на левую кнопку мыши будет удалено меню
        google.maps.event.addListener(map, 'click', function() {
          $('.dropdown').remove();
        });
      }

      // добавление маркера по нажатию правой кнопки
      function addMarker(location, map) {
        marker = new google.maps.Marker({
          position: location,
          label: "A",
          map: map
        });
      }

      // когда перетаскиваем путь меняет данные на новые 
      function computeTotalDistance(result) {
        var route = result.routes[0];
        for (var i = 0; i < route.legs.length; i++) {
          start_address.textContent = route.legs[i].start_address;
          end_address.textContent = route.legs[i].end_address;
          time.textContent = route.legs[i].duration.text;
          distance.textContent = route.legs[i].distance.text;
        }
      }
      
      // генерация пути 
      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        if (latlngA != null && latlngB != null){
          marker.setMap(null);
          var selectedMode = document.getElementById('mode').value; // берём данные с combobox
          
          directionsService.route({                                 // посылаем на сервер данные с начальным,
            origin: latlngA,                                        // конечным путём и способом передвежения
            destination: latlngB,  
            travelMode: google.maps.TravelMode[selectedMode]
          }, function(response, status) {                           // ответом служит готовый путь
            if (status == 'OK') {
              directionsDisplay.setDirections(response);            // отображаем путь на карте
              var route = response.routes[0];
              for (var i = 0; i < route.legs.length; i++) {         // меняем данные 
                start_address.textContent = route.legs[i].start_address;
                end_address.textContent = route.legs[i].end_address;
                time.textContent = route.legs[i].duration.text;
                distance.textContent = route.legs[i].distance.text;
              }
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        }
      }

      // берём координаты для отображения контекстного меню
      function getCanvasXY(caurrentLatLng){
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
             map.getBounds().getNorthEast().lat(),
             map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = map.getProjection().fromLatLngToPoint(caurrentLatLng);
        var caurrentLatLngOffset = new google.maps.Point(
             Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
             Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
        return caurrentLatLngOffset;
      }

      // создание компонента для контекстного меню
      function setMenuXY(caurrentLatLng){
        var mapWidth = $('#map').width();
        var mapHeight = $('#map').height();
        var menuWidth = $('.dropdown').width();
        var menuHeight = $('.dropdown').height();
        var clickedPosition = getCanvasXY(caurrentLatLng);
        var x = clickedPosition.x ;
        var y = clickedPosition.y ;
    
        if((mapWidth - x ) < menuWidth)
          x = x - menuWidth;
        if((mapHeight - y ) < menuHeight)
          y = y - menuHeight;
    
        $('.dropdown').css('left', x);
        $('.dropdown').css('top', y);
      }

      // отображение контекстного меню
      function showContextMenu(caurrentLatLng){
        var projection;
        var contextmenuDir;

        projection = map.getProjection();

        $('.dropdown').remove();
        contextmenuDir = document.createElement("div");
        contextmenuDir.className  = 'dropdown';

        contextmenuDir.innerHTML = "<ul class=\"dropdown-menu\">\
          <li class=\"click1\"><a href=\"#\">Проложить маршрут отсюда</a></li>\
          <li class=\"click2\"><a href=\"#\">Проложить маршрут сюда</a></li>\
          <li class=\"click3\"><a href=\"#\">Удалить маршрут</a></li>\
        </ul>";
        $(map.getDiv()).append(contextmenuDir);
        setMenuXY(caurrentLatLng);
        contextmenuDir.style.visibility = "visible";

        // по нажатию на 1 пункт меню устанавливаем начальную точку
        $('.click1').click(function(){
          if(marker){
            marker.setMap(null);
          }
          latlngA = caurrentLatLng;
          addMarker(latlngA, map);
          $('.dropdown').remove();
        });

        // по нажатию на 2 пункт меню устанавливаем конеччную точку и генерируем путь
        $('.click2').click(function(){
          latlngB = caurrentLatLng;
          calculateAndDisplayRoute(directionsService, directionsDisplay);
          $('.dropdown').remove();
        });

        // по нажатию на 3 пункт меню удаляем существующий путь
        $('.click3').click(function(){
          if(marker){
            marker.setMap(null);
          }
          latlngA = null;
          latlngB = null;
          start_address.textContent = "-";
          end_address.textContent = "-";
          time.textContent = "-";
          distance.textContent = "-";
          $('.dropdown').remove();
          directionsDisplay.setDirections({routes: []});
        });
          
      }
