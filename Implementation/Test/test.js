const webdriverio = require('webdriverio');
const expect      = require('chai').expect;

const siteURL = 'http://localhost:8080';
const host = 'localhost';
const port = '27017';
const address = `localhost:27017`;
const database = 'local';
const collection = 'startup_log';
const searchValue = 'MacBook-Pro.local-1474958132253';
const emptySearchValue = '';
const newTabName = 'Test Name';
const pageSize = 5;
const editArray = ['a', 'b', 'c', '1', '2', '3'];
const editValue = 'abc123';


describe("retrieving data from a connected database server", function() {

    this.timeout(10000);  // prevent mocha from terminating a test to soon,
                          // when browser is slow
    let allBrowsers, chrome;

    before((done) => {
        allBrowsers = webdriverio.multiremote({
            chrome: {desiredCapabilities: {browserName: 'chrome'}}
        });
        allBrowsers.init().url(siteURL).then(function () {
            done();
        });
        chrome = allBrowsers.select("chrome");
    });
    it("Should show the header", (done) => {
        chrome
            .elements("#react-root > div > div > div:nth-child(1) > ul").then((elements) => {
            expect(elements.value).to.exist;
            done();
        })
    });
    it("Should show no tabs", (done) => {
        chrome
            .isExisting("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab").then((result) => {
            expect(result).to.be.false;
            done();
        });
    });
    it("Should open a modalwindow with empty inputs", (done) => {
        chrome
            .click("#react-root > div > div > div:nth-child(1) > ul > li:nth-child(1)")
            .waitForExist("body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body").then(() => {
            chrome.getValue('#addressInput').then((value) => {
                expect(value).to.equal("");
                chrome.getValue('#portInput').then((value) => {
                    expect(value).to.equal("");
                    done();
                });
            });
        });
    });
    it("Should give a warning when connecting with no input", (done) => {
        chrome.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary.ant-btn-lg').then(() => {
            expect('.ant-notification-notice').to.exist;
            done();
        });
    });
    it("Should give an error when connecting to nonexistant database", (done) => {
        chrome.setValue('#addressInput', '123.456.789').then(() => {
            chrome.setValue('#portInput', '000000').then(() => {
                chrome.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary.ant-btn-lg').then(() => {
                    setTimeout(() => {
                        expect('.ant-notification-notice-icon-error').to.exist;
                        done();
                    }, 1000);
                });
            });
        });
    });
    it("should connect to the database", (done) => {
        chrome.setValue('#addressInput', host).then(() => {
            chrome.setValue('#portInput', port).then(() => {
                chrome.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary.ant-btn-lg').then(() => {
                    setTimeout(() => {
                        expect('.ant-message-success').to.exist;
                        done();
                    }, 500);
                });
            });
        });
    });
    it("should show a list with all the connections", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.elements('li.ant-menu-submenu-vertical.ant-menu-submenu').then((elements) => {
                expect(elements.value).to.exist;
                done();
            })
        })
    });
    it("should show a list with all the databases", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.click('li.ant-menu-submenu-vertical.ant-menu-submenu').then(() => {
                chrome.elements('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(4) > div').then((elements) => {
                    expect(elements.value).to.exist;
                    done();
                })
            });
        })
    });
    it("should show a list with all the collections", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.click('li.ant-menu-submenu-vertical.ant-menu-submenu').then(() => {
                chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(4) > div').then((elements) => {
                    chrome.elements('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(4) > ul > li > ul > li:nth-child(1)').then((elements) => {
                        expect(elements.value).to.exist;
                        done();
                    });
                })
            });
        })
    });
    it("should open a collection", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.click('li.ant-menu-submenu-vertical.ant-menu-submenu').then(() => {
                chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(4) > div').then(() => {
                    chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(4) > ul > li > ul > li:nth-child(1)').then(() => {
                        expect('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab').to.exist;
                    })
                })
            })
        })
    });

    // it("should give an error when creating a connection that already exists", (done) => {
    //     chrome
    //         .click("#react-root > div > div > div:nth-child(1) > ul > li:nth-child(1)")
    //         .waitForExist("body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body").then(() => {
    //             chrome.click('body > div:nth-child(3) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary.ant-btn-lg').then((el) => {
    //                 setTimeout(() => {
    //                     expect('.ant-notification-notice-icon-error').to.exist;
    //                     done();
    //                 }, 1000);
    //             });
    //         });
    // });
    it("should select a collection", (done) => {
        chrome
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div')
            .click('li.ant-menu-submenu-vertical.ant-menu-submenu')
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(3) > div')
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(3) > ul > li > ul > li:nth-child(1)').then(() => {
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it("should open a new tab", (done) => {
        chrome
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div')
            .click('li.ant-menu-submenu-vertical.ant-menu-submenu')
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(1) > div')
            .click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(1) > ul > li > ul > li:nth-child(1)')
            .then(() => {
                setTimeout(() => {
                    chrome
                        .isExisting("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(1)")
                        .then(() => {
                            done();
                        });
                }, 1500);
            })

    });
    it("should show multiple opened collections", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.click('li.ant-menu-submenu-vertical.ant-menu-submenu').then(() => {
                chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(5) > div').then(() => {
                    chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(5) > ul > li > ul > li:nth-child(2)').then(() => {
                        chrome.elements('.ant-tabs-nav').then((elements) => {
                            expect(elements.value.length).to.be.at.least(1);
                            done();
                        });
                    });
                });
            })
        })
    });
    // it('should delete the selected documents', (done) => {
    //     chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div:nth-child(4) > ul > li > ul > li:nth-child(1) > span.ant-tree-checkbox > span').then(() => {
    //         chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > ul > li:nth-child(2) > i').then(() => {
    //             chrome.click('body > div:nth-child(7) > div > div.ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-confirm-btns > button.ant-btn.ant-btn-primary.ant-btn-lg').then(() => {
    //                 setTimeout(() => {
    //                     expect('.ant-message-success').to.exist;
    //                     done();
    //                 }, 500)
    //             })
    //         })
    //     })
    // });
    it("should close a tab", (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab > div > i').then(() => {
            //expect('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(3)').to.not.exist;
            done();
        })
    });
    it('should refresh the page', (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li:nth-child(4)').then(() => {
            done();
        })
    });
    it('should show the content of a document', (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > div > div').then(() => {
            chrome.click('li.ant-menu-submenu-vertical.ant-menu-submenu').then(() => {
                chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(2) > div').then(() => {
                    chrome.click('#react-root > div > div > div:nth-child(1) > ul > li.ant-menu-submenu-horizontal.ant-menu-submenu > ul > li > ul > li > ul > li > ul > li:nth-child(2) > ul > li > ul > li:nth-child(2)').then(() => {
                        chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div:nth-child(4) > ul > li > ul > li:nth-child(1) > span.ant-tree-switcher.ant-tree-noline_close').then(() => {
                            chrome.getValue('.leafKey').then((val) => {
                                setTimeout(() => {
                                    ;
                                    expect(val).to.exist;
                                    done();
                                }, 500);
                            });
                        });
                    });
                });
            })
        })
    });
    it('should show nothing in an empty collection', (done) => {
        chrome.getValue('.branchKey').then((val) => {
            console.log(val);
            expect(val).to.be.null;
            done();
        })
    });
    it('should show the content of an array', (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div > div:nth-child(4) > ul > li > ul > li:nth-child(1) > ul > li:nth-child(7) > span.ant-tree-switcher.ant-tree-noline_open').then(() => {
            chrome.getValue('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div:nth-child(4) > ul > li > ul > li:nth-child(1) > ul > li:nth-child(1) > a > span > div > span.leafKey').then((val) => {
                setTimeout(() => {
                    console.log(val);
                    //expect(val).to.exist;
                }, 500);
            })
        })
    });
    it('should download the selected documents', (done) => {
        chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > div:nth-child(4) > ul > li > span.ant-tree-checkbox > span').then(() => {
            chrome.click('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div.ant-tabs-tabpane.ant-tabs-tabpane-active > ul > li:nth-child(3) > i').then(() => {
                done();
            })
        })
    });
    // it("Should open the settings modal", done => {
    it("should switch the active tab", done => {
        chrome
            .click(" #react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(2)")
            .then(() => {
                setTimeout(() => {
                    chrome
                        .isExisting("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(3)")
                        .then((result) => {
                            expect(result).to.be.true;
                            done();
                        });
                }, 500)
            });
    });
    it("should rename the tab", done => {
        chrome
            .doubleClick("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab > div > span")
            .setValue('#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab > div > input', newTabName)
            .keys(['\uE007'])
            .getText("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab > div > span")
            .then(text => {
                expect(text).to.equal(newTabName);
                done();
            })
    });
    it("should close the tab", (done) => {
        chrome
            .click("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(3)")
            .click("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div.ant-tabs-tab-active.ant-tabs-tab > div > i")
            .then(() => {
                setTimeout(() => {
                    chrome
                        .isExisting("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-bar > div > div > div > div > div:nth-child(1)")
                        .then((result) => {
                            expect(result).to.be.true;
                            done();
                        });
                }, 500)
            })
    });
    it("Should have a default page size of 20", done => {
        chrome
            .getAttribute("#inputForm1", "placeholder")
            .then(result => {
                expect(result).to.equal('Items: 20');
                done();
            })
    });
    it("Should give a warning with an empty page size", done => {
        chrome
            .setValue("#inputForm1", '')
            .click("#pageSizeForm > button")
            .then(() => {
                chrome
                    .waitForExist('.ant-notification-notice')
                    .then(() => {
                        done();
                    })
            })
    });
    it("Should not allow an invalid page size", done => {
        chrome
            .setValue("#inputForm1", '-1')
            .click("#pageSizeForm > button")
            .then(() => {
                chrome
                    .waitForExist('.ant-notification-notice-icon-error')
                    .then(() => {
                        done();
                    })
            })
    });
    // it("Should set the default page value and request a new page", done => {
    //     chrome
    //         .setValue("#inputForm1", pageSize)
    //         .click("#pageSizeForm > button")
    //         .then(() => {
    //             setTimeout(() => {
    //                 chrome
    //                     .elements("span.ant-tree-switcher.ant-tree-noline_close")
    //                     .then((results) => {
    //                         expect(results.value.length).to.equal(pageSize);
    //                         done();
    //                     });
    //             }, 1500)
    //         })
    // });
    it("should change the view", done => {
        chrome
            .click("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div > ul > li:nth-child(5)")
            .waitForExist("#finderColumn0")
            .then(() => {
                done();
            })
    });

    it("Should show a warning if nothing is selected", done => {
        chrome
            .click("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div > ul > li:nth-child(1)")
            .waitForExist(".ant-notification-notice")
            .then(() => {
                done();
            })
    });

    it("Should open a document in the JSON view", done => {
        chrome
            .click("#finderColumn0 > ul > li > ul > li:nth-child(1) > span.ant-tree-checkbox")
            .click("#react-root > div > div > div:nth-child(1) > div > div > div.ant-tabs-content.ant-tabs-content-no-animated > div > ul > li:nth-child(1)")
            .waitForExist("#jsonViewComponent > div.ace_scroller > div")
            .then(() => {
                done();
            })
    });

    it("Should update a document", done => {
        chrome
            .doubleClick("#jsonViewComponent > div.ace_scroller > div > div.ace_layer.ace_text-layer > div:nth-child(4) > span.ace_variable")
            .doubleClick("#jsonViewComponent > div.ace_scroller > div > div.ace_layer.ace_text-layer > div:nth-child(4) > span.ace_variable")
            .keys(editArray)
            .click("body > div:nth-child(7) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > div > button.ant-btn.ant-btn-primary.ant-btn-lg")
            .then(() => {
                setTimeout(() => {
                    chrome
                        .click("#finderColumn0 > ul > li > ul > li:nth-child(1) > a > span > div")
                        .getText("#finderColumn1 > ul > li:nth-child(2) > a > span > div > span.branchKey")
                        .then((results) => {
                            expect(results).to.equal(editValue + ':');
                            done();
                        });
                }, 1500)
            });
    });

    it("Should open the settings modal", done => {
        chrome
            .click("#react-root > div > div > div:nth-child(1) > ul > li:nth-child(3)")
            .waitForExist("body > div:nth-child(3) > div > div.ant-modal-mask")
            .then(() => {
                done();
            })
    });
    it("Should switch the default view", done => {
        chrome
            .click("#myForm > div:nth-child(1) > div.ant-col-14 > div > div > div > div")
            .click("body > div:nth-child(7) > div > div > div > ul > li:nth-child(2)")
            .getAttribute("#myForm > div:nth-child(1) > div.ant-col-14 > div > div > div > div > div", "title")
            .then(value => {
                expect(value).to.equal("Finder view");
                done();
            })
    });
    it("Should not accept an invalid default page size", done => {
        chrome
            .setValue("#myForm > div:nth-child(2) > div.ant-col-14 > div > div > div.ant-input-number-input-wrap > input", "-100")
            .getAttribute("#myForm > div:nth-child(2) > div.ant-col-14 > div > div > div.ant-input-number-input-wrap > input", "value")
            .then(value => {
                chrome
                    .click("#myForm > div:nth-child(2) > div.ant-col-14 > div > div > div.ant-input-number-handler-wrap > span.ant-input-number-handler.ant-input-number-handler-up")
                    .getAttribute("#myForm > div:nth-child(2) > div.ant-col-14 > div > div > div.ant-input-number-input-wrap > input", "value")
                    .then((value) => {
                        expect(value).to.equal("2");
                        done();
                    })
            })
    });
    it("Should change the setting for viewing empty arrays", done => {
        chrome
            .click("#showEmptyArr")
            .waitForExist("#showEmptyArr > span > i.anticon-cross")
            .then(() => {
                done();
            })
    });
    it("Should change the setting for viewing empty objects", done => {
        chrome
            .click("#showEmptyObj")
            .waitForExist("#showEmptyObj > span > i.anticon-cross")
            .then(() => {
                done();
            })
    });
    it("Should change the setting for viewing breadcrumbs", done => {
        chrome
            .click("#showBreadcrumbs")
            .waitForExist("#showBreadcrumbs > span > i.anticon-cross")
            .then(() => {
                done();
            })
    });
    it("Should set the color scheme", done => {
        chrome
            .click("#myForm > div:nth-child(6) > div.ant-col-14 > div > div > div")
            .click("body > div:nth-child(8) > div > div > div > ul > li:nth-child(7)")
            .getAttribute("#myForm > div:nth-child(6) > div.ant-col-14 > div > div > div > div > div", "title")
            .then((result) => {
                expect(result).to.equal("Orange");
                done();
            });
    });
    it("should save the settings", done => {
        chrome
            .click("#myForm > div:nth-child(7) > div.ant-col-14 > div > button.ant-btn.ant-btn-primary.ant-btn-lg")
            .getCssProperty("#headerLogo", "fill")
            .then((result) => {
                setTimeout(() => {
                    expect(result.parsed.hex).to.equal("#ffa500");
                    done();
                }, 2000);
            });
    });
});