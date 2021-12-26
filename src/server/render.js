import React from 'react';
import { renderToString } from 'react-dom/server';
import { getStaticRouter, getRootElementSelector, getData } from '#';

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
    // 获取数据
    getData(req).then(data => {
      const content = renderToString(staticRouter);

      $(getRootElementSelector()).html(content);

      // 把获取的数据放入window._crsStore中
      $.root().append(`<script>window._crsStore = JSON.stringify(${data});</script>`);

      res.send($.html());
    });
  });
}
