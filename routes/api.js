var express = require('express');
var router = express.Router();
var authentication = require('../authentication');
var request = require('request-promise');
var url = require('url');

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).send({
    authUri: authentication.getAuthUri(),
    msg: 'Authentication required.'
  });
}

router.post('/logout', function(req, res) {
  req.session.destroy();
  return res.send({});
});

router.getSession = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/users/session',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    console.log('****** getSession - CATCH ' + data.statusCode);
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        router.getElementList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting session: ', err);
      });
    } else {
      console.log('GET /api/users/session error: ', data);
    }
  });
};

exports.getDocuments = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/documents',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting documents: ', err);
      });
    } else {
      console.log('GET /api/documents error: ', data);
    }
  });
};

router.getElementList = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/documents/d/' + req.query.documentId + '/w/' + req.query.workspaceId + '/elements',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    //console.log('****** getElementList - send data');

    res.send(data);
  }).catch(function(data) {
    console.log('****** getElementList - CATCH ' + data.statusCode);
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        router.getElementList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/documents/elements error: ', data);
    }
  });
};

router.getShadedView = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/assemblies/d/' + req.query.documentId +
    '/w/' + req.query.workspaceId + '/e/' + req.query.elementId + 'shadedviews?' +
    '&outputHeight=' + req.query.outputHeight + '&outputWidth=' + req.query.outputWidth + '&pixelSize=' + req.query.pixelSize +
    '&viewMatrix=' + req.query.viewMatrix1 + '&viewMatrix=' + req.query.viewMatrix2 + '&viewMatrix=' + req.query.viewMatrix3 + '&viewMatrix=' + req.query.viewMatrix4 +
    '&viewMatrix=' + req.query.viewMatrix5 + '&viewMatrix=' + req.query.viewMatrix6 + '&viewMatrix=' + req.query.viewMatrix7 + '&viewMatrix=' + req.query.viewMatrix8 +
    '&viewMatrix=' + req.query.viewMatrix9 + '&viewMatrix=' + req.query.viewMatrix10 + '&viewMatrix=' + req.query.viewMatrix11 + '&viewMatrix=' + req.query.viewMatrix12,
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {

    res.send(data);
  }).catch(function(data) {

    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        router.getElementList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/assemblies/boundingbox error: ', data);
    }
  });
};

router.getBoundingBox = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/assemblies/d/' + req.query.documentId +
          '/w/' + req.query.workspaceId + '/e/' + req.query.elementId + '/boundingboxes/',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {

    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        router.getElementList(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/assemblies/boundingbox error: ', data);
    }
  });
};

router.getPartsList = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/parts/d/' + req.query.documentId + '/w/' + req.query.workspaceId,
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/parts/workspace error: ', data);
    }
  });
};

router.getAssemblyDefinition = function(req, res) {
  request.get({
    uri: 'https://partner.dev.onshape.com/api/assemblies/d/' + req.query.documentId + '/w/' + req.query.workspaceId + '/e/' + req.query.nextElement + '?includeMateFeatures=false',
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting definition: ', err);
      });
    } else {
      console.log('GET /api/models/assembly/definition error: ', data);
    }
  });
};

router.getStl = function(req, res) {

  var url = 'https://partner.dev.onshape.com/api/documents/' + req.query.documentId + '/export/' + req.query.stlElementId +
      '?workspaceId=' + req.query.workspaceId +
      '&format=STL&mode=' + 'text'  +
      '&scale=1&units=inch';
  if (req.query.partId !== '') {
    url += '&partId=' + req.query.partId;
  }
  if (req.query.angleTolerance !== '' && req.query.chordTolerance !== '') {
    url += '&angleTolerance=' + req.query.angleTolerance +'&chordTolerance=' + req.query.chordTolerance;
  }

  request.get({
    uri: url,
    headers: {
      'Authorization': 'Bearer ' + req.user.accessToken
    }
  }).then(function(data) {
    res.send(data);
  }).catch(function(data) {
    if (data.statusCode === 401) {
      authentication.refreshOAuthToken(req, res).then(function() {
        getDocuments(req, res);
      }).catch(function(err) {
        console.log('Error refreshing token or getting elements: ', err);
      });
    } else {
      console.log('GET /api/parts/workspace error: ', data);
    }
  });
};

router.get('/documents', function(req, res) {
  getDocuments(req, res);
});

module.exports = router;
