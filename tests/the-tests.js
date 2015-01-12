var expect = require('expect');

var challengeSeen = function (rcvdTimestamp, controller) {
  controller.start = rcvdTimestamp;
};

var response = function (rcvdTimestamp, controller) {
  if (controller.state === 'ready') {
      controller.state = "started";
      return;
  }
  if (controller.state === 'started') {
      controller.state = 'complete';
      controller.score = rcvdTimestamp - controller.start;
      return;
  }
};

var reset = function (controller) {
  if (controller.state !== 'complete') {
      return;
  }

  controller.score = 0;
  controller.start = 0;
  controller.state = "ready";
};

var extendArray = function (controller) {
  controller.list.push(3);
}

var global = {
  controller: {
    start: 0,
    score: 0,
    state: 'ready',
    list: [4]
  }
};

describe("the code", function () {
  it("should allow a standard game", function () {
    var serverStartTime = 4000;
    var clientStartTime = 5000;
    var completeTime = 7000;
    expect(global.controller.state).toBe('ready');

    response(serverStartTime, global.controller);
    expect(global.controller.state).toBe('started');
    expect(global.controller.start).toBe(0);

    challengeSeen(clientStartTime, global.controller);
    expect(global.controller.start).toBe(5000);

    response(completeTime, global.controller);
    expect(global.controller.state).toBe('complete');
    expect(global.controller.start).toBe(5000);
    expect(global.controller.score).toBe(2000);

    reset(global.controller);
    expect(global.controller.state).toBe('ready');
    expect(global.controller.start).toBe(0);
    expect(global.controller.score).toBe(0);
  });

  it("should work with adding to arrays", function () {
    extendArray(global.controller);
    expect(global.controller.list).toEqual([4, 3]);
  });
});