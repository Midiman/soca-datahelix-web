import React, { useState, useEffect, useContext, useMemo, lazy, Suspense } from 'react';
import { Container, Card, Row, Col, Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';


const DEFAULT_REFRESH_MS = 15 * 60 * 1000;

function ThoughtLeadershipBoard({
    endpoint = '/api/thought-leadership',
    refreshMs = DEFAULT_REFRESH_MS,
    autoScroll = false,
    autoScrollMs = 10000
})
{
    const [articles, setArticles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const viewportRef = React.useRef(null);


    // -------------------------------------------------------------------------
    // Data gathering
    // -------------------------------------------------------------------------

    const loadArticles = React.useCallback(async () =>
    {
        try
        {

            //PDS TEST
            const dummyArticles = [
                {
                    id: 'ncsc-001',
                    source: 'NCSC',
                    title: 'How to respond to a cyber incident',
                    summary: 'Practical guidance for organisations preparing for and responding to cyber security incidents.',
                    url: 'https://www.ncsc.gov.uk/',
                    image: '/images/NCSC-bulletin-card.png',
                    date: '2026-08-20T09:00:00Z'
                },
                {
                    id: 'ncsc-002',
                    source: 'NCSC',
                    title: 'AI and cyber security: what you need to know',
                    summary: 'An overview of how artificial intelligence is changing both cyber defence and cyber attack capabilities.',
                    url: 'https://www.ncsc.gov.uk/',
                    image: '/images/NCSC-bulletin-card-2.png',
                    date: '2026-08-19T14:30:00Z'
                },
                {
                    id: 'fbi-001',
                    source: 'FBI',
                    title: 'Cyber criminals continue targeting exposed services',
                    summary: 'The FBI warns organisations to review internet-facing systems, patch known vulnerabilities and monitor suspicious access.',
                    url: 'https://www.fbi.gov/investigate/cyber',
                    image: null,
                    date: '2026-08-18T11:00:00Z'
                },
                {
                    id: 'cisa-001',
                    source: 'CISA',
                    title: 'New vulnerabilities added to exploited catalogue',
                    summary: 'Security teams should prioritise remediation of newly identified vulnerabilities known to be actively exploited.',
                    url: 'https://www.cisa.gov/',
                    image: null,
                    date: '2026-08-17T16:15:00Z'
                },
                {
                    id: 'msrc-001',
                    source: 'Microsoft Security',
                    title: 'Threat actors evolve identity-based attacks',
                    summary: 'Attackers are increasingly combining credential theft, session hijacking and social engineering to bypass traditional controls.',
                    url: 'https://www.microsoft.com/en-us/security/blog/',
                    image: null,
                    date: '2026-08-16T08:45:00Z'
                },
                {
                    id: 'mandiant-001',
                    source: 'Mandiant',
                    title: 'Cloud environments remain a key attacker target',
                    summary: 'Recent investigations show continued focus on cloud identities, exposed credentials and poorly controlled administrative access.',
                    url: 'https://cloud.google.com/blog/topics/threat-intelligence',
                    image: null,
                    date: '2026-08-15T13:20:00Z'
                }
            ];
            setArticles(dummyArticles);
            return;

            setError(null);

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok)
                throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            const items = Array.isArray(data)
                ? data
                : data?.articles || [];

            setArticles(
                items
                    .map(normaliseArticle)
                    .filter(a => a.title && a.url)
            );
        }
        catch (err)
        {
            console.error('ThoughtLeadershipBoard:', err);
            setError(err.message || 'Unable to load articles');
        }
        finally
        {
            setLoading(false);
        }
    }, [endpoint]);


    React.useEffect(() =>
    {
        loadArticles();

        if (!refreshMs)
            return;

        const timer = setInterval(loadArticles, refreshMs);

        return () => clearInterval(timer);

    }, [loadArticles, refreshMs]);


    // -------------------------------------------------------------------------
    // Carousel
    // -------------------------------------------------------------------------

    function scroll(direction)
    {
        const el = viewportRef.current;

        if (!el)
            return;

        const amount = Math.max(el.clientHeight * 0.75, 180);

        el.scrollBy({
            top: direction * amount,
            behavior: 'smooth'
        });
    }


    React.useEffect(() =>
    {
        if (!autoScroll || articles.length < 2)
            return;

        const timer = setInterval(() =>
        {
            const el = viewportRef.current;

            if (!el)
                return;

            const atBottom =
                el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

            if (atBottom)
            {
                el.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            else
            {
                scroll(1);
            }

        }, autoScrollMs);

        return () => clearInterval(timer);

    }, [autoScroll, autoScrollMs, articles.length]);


    // -------------------------------------------------------------------------
    // Article rendering
    // -------------------------------------------------------------------------

    function renderArticle(article)
    {
        return (
            <article
                key={article.id}
                className="tl-card"
                onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
            >
                {article.image &&
                    <div className="tl-card-image">
                        <img
                            src={article.image}
                            alt=""
                            loading="lazy"
                        />
                    </div>
                }

                <div className="tl-card-content">
                    <div className="tl-card-meta">
                        <span className="tl-source">{article.source}</span>

                        {article.date &&
                            <span className="tl-date">
                                {formatDate(article.date)}
                            </span>
                        }
                    </div>

                    <div className="tl-card-title">
                        {article.title}
                    </div>

                    {article.summary &&
                        <div className="tl-card-summary">
                            {article.summary}
                        </div>
                    }

                    <div className="tl-card-link">
                        Read article →
                    </div>
                </div>
            </article>

            // <article
            //     key={article.id}
            //     className="tl-card"
            //     onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
            // >
            //     {/* {article.image &&
            //         <div className="tl-card-image">
            //             <img
            //                 src={article.image}
            //                 alt=""
            //                 loading="lazy"
            //             />
            //         </div>
            //     } */}

            //     <div className="tl-card-content">

            //         <div className="tl-card-meta">
            //             <span className="tl-source">
            //                 {article.source}
            //             </span>

            //             {article.date &&
            //                 <span className="tl-date">
            //                     {formatDate(article.date)}
            //                 </span>
            //             }
            //         </div>

            //         <div className="tl-card-title">
            //             {article.title}
            //         </div>

            //         {article.summary &&
            //             <div className="tl-card-summary">
            //                 {article.summary}
            //             </div>
            //         }

            //         <div className="tl-card-link">
            //             Read article →
            //         </div>

            //     </div>
            // </article>
        );
    }


    // -------------------------------------------------------------------------
    // Main
    // -------------------------------------------------------------------------

    return (
        <div className="thought-leadership-board">

            <div className="tl-header">
                <div>
                    <span className="tl-heading">
                        Cyber Intelligence advisories & insight
                    </span>
                    <Button
                        className="toolbar-btn tl-refresh"
                        onClick={loadArticles}
                        title="Refresh"
                    >
                        ↻
                    </Button>
                </div>

            </div>


            <div className="tl-carousel">

                <Button
                    className="toolbar-btn tl-nav tl-nav-up"
                    onClick={() => scroll(-1)}
                >
                    ▲
                </Button>


                <div
                    ref={viewportRef}
                    className="tl-viewport"
                >
                    {loading &&
                        <div className="tl-message">
                            Loading...
                        </div>
                    }

                    {!loading && error &&
                        <div className="tl-message tl-error">
                            Unable to load articles
                        </div>
                    }

                    {!loading && !error && articles.length === 0 &&
                        <div className="tl-message">
                            No current articles
                        </div>
                    }

                    {!loading && !error &&
                        articles.map(renderArticle)
                    }
                </div>


                <Button
                    className="toolbar-btn tl-nav tl-nav-down"
                    onClick={() => scroll(1)}
                >
                    ▼
                </Button>

            </div>

        </div>
    );
}


// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function normaliseArticle(article)
{
    return {
        id:
            article.id ||
            article.guid ||
            article.url,

        source:
            article.source ||
            'Cyber Security',

        title:
            article.title?.trim(),

        summary:
            stripHtml(
                article.summary ||
                article.description ||
                ''
            ),

        url:
            article.url ||
            article.link,

        image:
            article.image ||
            article.thumbnail ||
            null,

        date:
            article.date ||
            article.pubDate ||
            article.published ||
            null
    };
}


function stripHtml(value)
{
    if (!value)
        return '';

    const div = document.createElement('div');

    div.innerHTML = value;

    return (div.textContent || div.innerText || '')
        .replace(/\s+/g, ' ')
        .trim();
}


function formatDate(value)
{
    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
        return '';

    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
    });
}
export { ThoughtLeadershipBoard };
