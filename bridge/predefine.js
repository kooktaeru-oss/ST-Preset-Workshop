window._ = window.parent._;

const iframeId = window.frameElement?.id || window.name;
if (iframeId) {
  window.__TH_IFRAME_ID = iframeId;
  if (!window.name) {
    window.name = iframeId;
  }
}

let result = _(window);
result = result.merge(_.pick(window.parent, ['EjsTemplate', 'TavernHelper', 'YAML', 'showdown', 'toastr', 'z']));
result = result.merge(_.omit(_.get(window.parent, 'TavernHelper'), '_bind'));
result = result.merge(
  ...Object.entries(_.get(window.parent, 'TavernHelper')._bind).map(([key, value]) => ({
    [key.replace('_', '')]: value.bind(window),
  })),
);
result.value();

_.set(window, '__VUE_PROD_DEVTOOLS__', true);
_.set(window, '__VUE_OPTIONS_API__', true);
_.set(window, '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__', false);

Object.defineProperty(window, 'SillyTavern', {
  get: () => {
    const SillyTavern = _.get(window.parent, 'SillyTavern');
    const getContext = () => ({ ...SillyTavern.getContext(), writeExtensionField: _th_impl.writeExtensionField });
    return { ...getContext(), getContext };
  },
});

if (_.has(window.parent, 'Mvu')) {
  Object.defineProperty(window, 'Mvu', {
    get: () => _.get(window.parent, 'Mvu'),
    set: () => {},
    configurable: true,
  });
}

$(window).on('pagehide', () => {
  eventClearAll();
});

