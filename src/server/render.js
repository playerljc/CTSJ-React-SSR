import React from 'react';
import { renderToString } from 'react-dom/server';
import { getStaticRouter, getRootElementSelector } from '#';

/**
 * render
 * @description - 进行路由的渲染
 * @param req
 * @param res
 * @param $
 */
export default function (req, res, $) {
  const context = {};

  getStaticRouter({ context, location: req.path }).then((staticRouter) => {
    const content = renderToString(staticRouter);

    $(getRootElementSelector()).html(content);

    res.send($.html());
  });
}
