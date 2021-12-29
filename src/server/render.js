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
    // 如果StaticRouter中使用了<Redirect> 则context中url不为空
    // console.log('context', context);

    if (context.url) {
      res.redirect(context.url);
      return;
    }

    // 获取数据
    getData(req).then(data => {
      // console.log('data', data);
      const content = renderToString(staticRouter);

      // console.log('$$$', $);

      // console.log('getRootElementSelector()', getRootElementSelector());

      // console.log('content', content);

      // console.log('$(getRootElementSelector())', $(getRootElementSelector()));

      $(getRootElementSelector()).html(content);

      // 把获取的数据放入window._crsStore中
      $.root().append(`<script>window._crsStore = JSON.stringify(${data});</script>`);

      // console.log('$.html()',$.html());
      res.send($.html());
    });
  });
}
