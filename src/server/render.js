const { renderToString } = require('react-dom/server');
const { getStaticRouter, getRootElementSelector } = require('#');

/**
 * render
 * @description - 进行路由的渲染
 * @param req
 * @param res
 * @param $
 */
module.exports = function (req, res, $) {
  const context = {};

  const content = renderToString(getStaticRouter({ context, location: req.path }));

  $(getRootElementSelector).html(content);

  res.send($.html());
};
