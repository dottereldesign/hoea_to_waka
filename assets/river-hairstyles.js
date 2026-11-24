(() => {
  const object = document.querySelector('.home-resources #river-within object');
  const picker = document.querySelector('[data-hairstyle-picker]');
  // Each contour runs from the temple over the crown to the nape.
  const styles = [
    ['Low twist', 'C336 262 435 255 473 322 C496 325 513 347 512 374 C531 408 516 444 475 456'],
    ['Pixie cut', 'C328 282 397 270 439 298 Q475 313 484 352 L493 347 Q494 368 483 378 L496 376 Q492 399 473 409 L483 411 Q470 434 475 456'],
    ['High bun', 'C322 301 355 288 388 295 C382 270 413 274 425 279 C452 268 477 292 467 316 C492 340 504 378 491 414 Q473 439 475 456'],
    ['Blunt bob', 'C333 271 411 263 459 304 C504 342 510 409 535 471 Q508 484 468 480 L461 444 Q465 453 475 456'],
    ['High ponytail', 'C337 274 414 264 467 317 C491 286 534 302 541 346 C550 391 533 433 574 460 C518 456 510 410 505 378 Q500 350 483 348 C494 396 470 427 475 456'],
    ['Cloud curls', 'C295 312 309 299 325 298 C328 279 350 276 363 284 C378 271 397 278 404 285 C424 274 444 282 450 298 C473 293 485 309 483 325 C504 325 517 344 508 362 C529 370 527 395 513 402 C519 423 498 440 485 434 Q475 440 475 456'],
    ['Long waves', 'C337 274 423 264 465 309 C505 353 484 389 514 422 C550 460 516 484 555 520 C585 550 575 579 607 595 C549 593 522 557 523 523 C487 506 497 476 475 456'],
    ['Plait', 'C334 276 417 266 466 314 C499 342 494 393 480 414 Q512 420 507 441 Q534 447 526 465 Q552 474 543 493 Q568 502 558 518 Q582 532 584 554 Q556 550 546 531 Q524 534 525 513 Q504 511 504 489 Q484 483 488 467 Q476 466 475 456'],
    ['Top knot', 'C319 299 343 292 357 290 C348 274 370 275 381 277 Q404 268 413 283 Q426 294 411 304 C465 312 491 353 484 399 Q473 433 475 456'],
    ['Loose chignon', 'C341 279 421 268 463 311 C489 334 495 367 487 390 C508 376 539 388 546 408 C563 444 539 469 510 468 Q493 469 475 456']
  ];
  let index = 0;
  let portrait, body;
  function show() {
    const [name, contour] = styles[index];
    portrait.setAttribute('d', 'M300 329 ' + contour + ' ' + body);
    picker.querySelector('strong').textContent = name;
    picker.querySelector('[data-count]').textContent = String(index + 1).padStart(2, '0') + ' / ' + styles.length;
    picker.hidden = false;
  }
  function setup() {
    const path = object.contentDocument?.getElementById('portrait');
    if (!path || path === portrait) return;
    // Keep the shared face, shoulder and landscape outline from the source SVG.
    const nape = '475 456 ';
    const outline = path.getAttribute('d');
    const end = outline.indexOf(nape);
    if (end < 0) return;
    portrait = path;
    body = outline.slice(end + nape.length);
    show();
  }
  picker.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (!button) return;
    index = (index + Number(button.dataset.step) + styles.length) % styles.length;
    show();
  });
  object.addEventListener('load', setup);
  setup();
})();
