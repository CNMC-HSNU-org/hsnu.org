import React, { useEffect, useState } from "react"
import { Container, Row, Col } from "react-bootstrap"
import axios from "axios"
import Seo from "../components/layout/Seo"

// style
import "../styles/scss/search/search.scss"

// tools
import Query from "../components/tools/Query/Query"
import Searchbox from "../components/tools/SearchBox/SearchBox"
import Filter from "../components/tools/Filter/Filter"
import SideNews from "../components/tools/SidewNews/SideNews"

const Search = ({ location }) => {
  //  search
  const [results, setResults] = useState([])
  const [status, setStatus] = useState("Searching...")
  const [page_now, setPage_now] = useState(2)

  // get search paramaters
  // (remember, there is no browser at build time)
  var search_param =
    typeof window !== "undefined"
      ? new URL(location.href).searchParams.get("search")
      : ""
  var genre_param =
    typeof window !== "undefined"
      ? new URL(location.href).searchParams.get("genre")
      : ""

  // search query to wordpress api
  useEffect(() => {
    axios
      .get(
        `${process.env.WORDPRESS_URL}/index.php/wp-json/wp/v2/spost?per_page=20&page=1${
          search_param ? `&search=${search_param}` : ""
        }${
          genre_param
            ? `&filter[meta_query][0][key]=genre&filter[meta_query][0][value]=${genre_param}`
            : ""
        }`
      )
      .then((res) => {
        console.log(res.data)
        if (res.data.length === 0) {
          setStatus("Nothing Found (´･_･`)")
        } else {
          setResults(res.data)
          setPage_now(page_now + 1)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  })

  // load when hit the (1/2) bottom
  useEffect(() => {
    window.onscroll = function () {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight / 2
      ) {
        axios
          .get(
            `${process.env.WORDPRESS_URL}/index.php/wp-json/wp/v2/spost?per_page=20&page=${page_now}${
              search_param ? `&search=${search_param}` : ""
            }${
              genre_param
                ? `&filter[meta_query][0][key]=genre&filter[meta_query][0][value]=${genre_param}`
                : ""
            }`
          )
          .then((res) => {
            console.log(res.data)
            setPage_now(page_now + 1)
            setResults(results.concat(res.data))
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
  }, [results])

  return (
    <>
      <Seo title={`搜尋 ${search_param || ""}`} />
      <div id="header-padding" />
      <Container id="search-page" fluid>
        <Row>
          <Col lg="7">
            <Searchbox showFilter />
            {results.length ? (
              <Query results={results} />
            ) : (
              <Container fluid id="search-result-container">
                <Row>
                  <Col className={"search-result"}>
                    {/* title */}
                    <h3 className={"is-3 bold"}>{status}</h3>
                  </Col>
                </Row>
              </Container>
            )}
          </Col>
          <Col lg={{ span: 4, offset: 1 }}>
            <Filter id="search-page-filter" />
            <SideNews infinity={true} />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Search
