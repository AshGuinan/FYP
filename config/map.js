angular.module('uiGmapGoogleMapApiProvider', []).config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyDQeJiXsYeWiZGbkgY2XvS0Vvxa1ZBU2Ek',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});
